import { Injectable, Logger } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
  TransactionType,
} from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/payment-Inscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/payment-Inscription/overpayment-not-allowed.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { RegisterPaymentPixUsecase } from '../register-pix/register-payment-pix.usecase';

export type RegisterPaymentAdminInput = {
  userId: string;
  amount: number;
  image: string;
  isGuest: boolean;
  guestName?: string;
  accountId?: string;
  inscriptions: Inscription[];
};

export type Inscription = {
  id: string;
  index?: number;
  amount?: number;
  status?: InscriptionStatus;
};

export type RegisterPaymentAdminOutput = {
  inscriptions: {
    id: string;
    status: InscriptionStatus;
  }[];
};

@Injectable()
export class RegisterPaymentAdminUsecase
  implements Usecase<RegisterPaymentAdminInput, RegisterPaymentAdminOutput>
{
  private readonly logger = new Logger(RegisterPaymentAdminUsecase.name);
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly eventGateway: EventGateway,
    private readonly userGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: RegisterPaymentAdminInput,
  ): Promise<RegisterPaymentAdminOutput> {
    this.logger.log(
      `Iniciando registro de pagamento administrativo para ${input.inscriptions.length} inscrições`,
    );

    // Validação: verificar se as inscrições existem
    const inscriptionsIds = input.inscriptions.map((i) => i.id);
    const inscriptions =
      await this.inscriptionGateway.findManyByIds(inscriptionsIds);

    if (inscriptions.length !== input.inscriptions.length) {
      throw new InvalidInscriptionIdUsecaseException(
        'One or more inscription IDs are invalid',
        'Um ou mais IDs de inscrição são inválidos',
        RegisterPaymentAdminUsecase.name,
      );
    }

    // Validação: confirmar que as inscrições são todas guest ou todas não-guest
    const allGuests = inscriptions.every((i) => i.getIsGuest());
    const noneGuests = inscriptions.every((i) => !i.getIsGuest());

    if (!allGuests && !noneGuests) {
      throw new InvalidInscriptionIdUsecaseException(
        'Mixing guest and non-guest inscriptions is not allowed',
        'Não é permitido misturar inscrições guest com não guest',
        RegisterPaymentAdminUsecase.name,
      );
    }

    // Validação: validar valores alocados por inscrição
    this.validateAllocationAmounts(input, inscriptions);

    // Processar e fazer upload da imagem de comprovante
    const imagePath = await this.processEventImage(
      input.image,
      inscriptions[0].getEventId(),
      input.amount,
      input.isGuest,
      input.accountId,
      input.guestName,
    );

    this.logger.log(`Imagem processada e salva em: ${imagePath}`);

    // Criar as entidades do pagamento
    const payment = Payment.create({
      eventId: inscriptions[0].getEventId(),
      accountId: input.isGuest ? undefined : input.accountId,
      guestName: input.isGuest ? input.guestName : undefined,
      guestEmail: input.isGuest ? undefined : undefined,
      isGuest: input.isGuest,
      status: StatusPayment.APPROVED,
      totalValue: input.amount,
      totalPaid: input.amount,
      totalNetValue: input.amount,
      totalReceived: input.amount,
      installment: 1,
      paidInstallments: 1,
      imageUrl: imagePath,
      methodPayment: PaymentMethod.PIX,
      approvedBy: input.userId,
    });

    // Criar alocações com base no índice
    const allocations: PaymentAllocation[] = [];
    const allocationsByIndex = input.inscriptions
      .filter((inv) => inv.index !== undefined)
      .sort((a, b) => (a.index || 0) - (b.index || 0));

    // Usar índice se fornecido, caso contrário usar ordem padrão
    const sortedInscriptions =
      allocationsByIndex.length > 0
        ? allocationsByIndex.map((inv) =>
            inscriptions.find((i) => i.getId() === inv.id),
          )
        : inscriptions;

    let remainingValue = input.amount;

    for (const inscription of sortedInscriptions) {
      if (!inscription) continue;

      const remainingInscriptionDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );

      // Se houver um valor específico de alocação, usar ele; caso contrário, usar o que resta
      const allocationValue = input.inscriptions.find(
        (inv) => inv.id === inscription.getId(),
      )?.amount
        ? Math.min(
            input.inscriptions.find((inv) => inv.id === inscription.getId())
              ?.amount || 0,
            remainingValue,
          )
        : Math.min(remainingInscriptionDebt, remainingValue);

      if (allocationValue > 0) {
        allocations.push(
          PaymentAllocation.create({
            paymentId: payment.getId(),
            inscriptionId: inscription.getId(),
            value: allocationValue,
          }),
        );

        remainingValue -= allocationValue;
        if (remainingValue <= 0) break;
      }
    }

    // Criar movimento financeiro
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(payment.getTotalValue()),
    });

    // Criar parcela do pagamento
    const paymentInstallment = PaymentInstallment.create({
      paymentId: payment.getId(),
      installmentNumber: 1,
      received: true,
      value: payment.getTotalValue(),
      netValue: payment.getTotalNetValue(),
      financialMovementId: financialMovement.getId(),
      paidAt: new Date(),
      estimatedAt: new Date(),
    });

    // Executar tudo dentro de uma transação
    await this.prisma.runInTransaction(async (tx) => {
      // Criar pagamento
      await this.paymentGateway.createTx(payment, tx);
      this.logger.log(`Pagamento criado: ${payment.getId()}`);

      // Criar movimento financeiro
      await this.financialMovementGateway.createTx(financialMovement, tx);
      this.logger.log(
        `Movimento financeiro criado: R$ ${payment.getTotalValue().toFixed(2)}`,
      );

      // Criar parcela do pagamento
      await this.paymentInstallmentGateway.createTx(paymentInstallment, tx);
      this.logger.log(`Parcela criada para pagamento ${payment.getId()}`);

      // Criar alocações e atualizar inscrições
      for (const allocation of allocations) {
        await this.paymentAllocationGateway.createTx(allocation, tx);
        const inscription = inscriptions.find(
          (i) => i.getId() === allocation.getInscriptionId(),
        );

        if (inscription) {
          inscription.incrementeValuePaid(allocation.getValue());
          await this.inscriptionGateway.updateTx(inscription, tx);
          this.logger.log(
            `Alocação criada e inscrição ${inscription.getId()} atualizada com R$ ${allocation.getValue().toFixed(2)}`,
          );

          // Verificar se a inscrição foi paga completamente
          if (
            inscription.getTotalPaid() >= inscription.getTotalValue() &&
            inscription.getStatus() !== InscriptionStatus.PAID
          ) {
            inscription.inscriptionPaid();
            await this.inscriptionGateway.updateTx(inscription, tx);
            this.logger.log(
              `Inscrição ${inscription.getId()} marcada como PAGA`,
            );
          }
        }
      }

      // Criar entradas no caixa
      await this.createCashRegisterEntriesTx(
        payment,
        paymentInstallment,
        input.userId,
        tx,
      );
    });

    // Atualizar evento com o valor recebido
    const event = await this.eventGateway.findById(payment.getEventId());
    if (event) {
      event.incrementAmountCollected(payment.getTotalPaid());
      event.incrementAmountNetValueCollected(payment.getTotalNetValue());
      await this.eventGateway.update(event);
      this.logger.log(`Evento ${event.getId()} atualizado com valor recebido`);
    }

    this.logger.log(
      `Pagamento aprovado! Valor: R$ ${payment.getTotalValue().toFixed(2)} | Valor líquido: R$ ${payment.getTotalNetValue().toFixed(2)}`,
    );

    const output: RegisterPaymentAdminOutput = {
      inscriptions: inscriptions.map((inscription) => ({
        id: inscription.getId(),
        status: inscription.getStatus(),
      })),
    };

    return output;
  }

  private async createCashRegisterEntriesTx(
    payment: Payment,
    paymentInstallment: PaymentInstallment,
    accountId: string,
    tx: any,
  ): Promise<void> {
    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(payment.getEventId());

    if (cashRegisterEvents.length === 0) {
      this.logger.warn(
        `Nenhum caixa registrador encontrado para o evento ${payment.getEventId()}`,
      );
      return;
    }

    const entries = cashRegisterEvents.map((cashRegisterEvent) =>
      CashRegisterEntry.create({
        cashRegisterId: cashRegisterEvent.getCashRegisterId(),
        type: CashEntryType.INCOME,
        origin: CashEntryOrigin.INTERNAL,
        method: PaymentMethod.PIX,
        value: paymentInstallment.getNetValue(),
        description: `Pagamento PIX referente a parcela ${paymentInstallment.getInstallmentNumber()} de ${payment.getInstallments()} do pagamento ${payment.getId()}`,
        eventId: payment.getEventId(),
        paymentInstallmentId: paymentInstallment.getId(),
        responsible: accountId,
        imageUrl: payment.getImageUrl(),
      }),
    );

    await this.cashRegisterEntryGateway.createManyTx(entries, tx);
    await this.updateCashRegisterBalancesTx(entries, tx);
    this.logger.log(`${entries.length} entradas de caixa criadas`);
  }

  private async updateCashRegisterBalancesTx(
    entries: CashRegisterEntry[],
    tx: any,
  ): Promise<void> {
    const deltaByCashRegisterId = new Map<string, number>();

    for (const entry of entries) {
      const cashRegisterId = entry.getCashRegisterId();
      const previous = deltaByCashRegisterId.get(cashRegisterId) ?? 0;
      const delta =
        entry.getType() === CashEntryType.INCOME
          ? entry.getValue()
          : -entry.getValue();

      deltaByCashRegisterId.set(cashRegisterId, previous + delta);
    }

    for (const [cashRegisterId, delta] of deltaByCashRegisterId.entries()) {
      if (delta === 0) continue;
      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;

      if (delta > 0) {
        cashRegister.incrementBalance(delta);
      } else {
        cashRegister.decrementBalance(-delta);
      }

      await this.cashRegisterGateway.updateTx(cashRegister, tx);
    }
  }

  private validateAllocationAmounts(
    input: RegisterPaymentAdminInput,
    inscriptions: any[],
  ): void {
    let totalAllocated = 0;

    // Validar cada inscrição que tem um amount específico
    for (const inputInscription of input.inscriptions) {
      if (
        inputInscription.amount === undefined ||
        inputInscription.amount === null
      ) {
        continue;
      }

      const inscription = inscriptions.find(
        (i) => i.getId() === inputInscription.id,
      );

      if (!inscription) {
        continue;
      }

      // Calcular quanto ainda falta pagar da inscrição
      const remainingDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );

      // Validar se o amount não ultrapassa o débito restante
      if (inputInscription.amount > remainingDebt) {
        throw new OverpaymentNotAllowedUsecaseException(
          `Attempted to allocate R$ ${inputInscription.amount.toFixed(2)} to inscription ${inputInscription.id}, but only R$ ${remainingDebt.toFixed(2)} is owed. Total value: R$ ${inscription.getTotalValue().toFixed(2)}, Already paid: R$ ${inscription.getTotalPaid().toFixed(2)}`,
          `O valor de R$ ${inputInscription.amount.toFixed(2)} ultrapassa o débito da inscrição (R$ ${remainingDebt.toFixed(2)})`,
          RegisterPaymentAdminUsecase.name,
        );
      }

      totalAllocated += inputInscription.amount;
    }

    // Validar se a soma dos amounts não ultrapassa o pagamento principal
    if (totalAllocated > input.amount) {
      throw new OverpaymentNotAllowedUsecaseException(
        `Total allocated (R$ ${totalAllocated.toFixed(2)}) exceeds the main payment amount (R$ ${input.amount.toFixed(2)})`,
        `A soma dos valores alocados (R$ ${totalAllocated.toFixed(2)}) ultrapassa o valor principal do pagamento (R$ ${input.amount.toFixed(2)})`,
        RegisterPaymentAdminUsecase.name,
      );
    }

    this.logger.log(
      `Validação de alocação concluída: R$ ${totalAllocated.toFixed(2)} de R$ ${input.amount.toFixed(2)}`,
    );
  }

  private async processEventImage(
    image: string,
    eventId: string,
    value: number,
    isGuest: boolean,
    accountId?: string,
    guestName?: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    // Valida a imagem
    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      `payment_${value}.${extension}`,
    );
    if (!isValidImage) {
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        RegisterPaymentPixUsecase.name,
      );
    }

    // Otimiza imagem (ex: converte para webp e reduz tamanho)
    const optimizedImage = await this.imageOptimizerService.optimizeImage(
      buffer,
      {
        maxWidth: 800,
        maxHeight: 800,
        quality: 70,
        format: 'webp',
        maxFileSize: 300 * 1024, // 300KB
      },
    );

    // Busca o nome do evento para incluir no nome do arquivo
    const eventName = await this.eventGateway.findById(eventId);

    let accountName;
    if (!isGuest && accountId) {
      //Busca o nome da conta para incluir no nome do arquivo
      accountName = await this.userGateway.findById(accountId);
    }

    // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(
      eventName?.getName() || 'evento',
    );

    // Sanitiza o nome da conta para evitar caracteres inválidos no Supabase
    const sanitizedName = sanitizeFileName(
      guestName || accountName?.getUsername() || 'conta',
    );

    // Cria nome do arquivo: payment+valor+hora formatada
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `payment_${accountId || sanitizedName}_${value}_${formattedDateTime}.${optimizedImage.format}`;

    // Define o nome da pasta com base no tipo de usuário (guest ou normal)
    const folderName = isGuest
      ? `payments/${sanitizedEventName}/guest/${sanitizedName}`
      : `payments/${sanitizedEventName}/normal/${sanitizedName}`;

    // Faz upload no Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: folderName,
      fileName: fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
