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
import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
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
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/payment-Inscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/payment-Inscription/overpayment-not-allowed.usecase.exception';
import { PaymentAllocationExceededUsecaseException } from '../../exceptions/payment-Inscription/payment-allocation-exceeded.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { RegisterPaymentPixUsecase } from '../register-pix/register-payment-pix.usecase';

export type RegisterPaymentAdminInput = {
  userId: string;
  amount: number;
  image: string;
  isGuest: boolean;
  guestName?: string;
  accountId?: string;
  inscriptions: InscriptionList[];
};

export type InscriptionList = {
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
    // valida se todos os id passados sao referentes a inscrições que existem.
    const inscriptions = await this.inscriptionGateway.findManyByIds(
      input.inscriptions.map((i) => i.id),
    );
    if (inscriptions.length !== input.inscriptions.length) {
      throw new InvalidInscriptionIdUsecaseException(
        'Failed to register payment because one or more provided inscription IDs were not found',
        'Um ou mais IDs de inscrição são inválidos',
        RegisterPaymentAdminUsecase.name,
      );
    }

    // valida se as inscrições passadas são de eventos diferentes
    const eventId = inscriptions[0].getEventId();
    if (!inscriptions.every((i) => i.getEventId() === eventId)) {
      throw new InvalidInscriptionIdUsecaseException(
        'Failed to register payment because inscriptions from different events were provided in the same payment request',
        'Inscrições de eventos diferentes não podem ser pagas juntas',
        RegisterPaymentAdminUsecase.name,
      );
    }

    // valida o evento, como já verificamos se tem mais de um evento
    // podemos pegar o primeiro porque os demais são do mesmo evento
    const event = await this.eventGateway.findById(eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Failed to register payment because it was not possible to find the event corresponding to registrations`,
        'Evento não encontrado',
        RegisterPaymentAdminUsecase.name,
      );
    }

    // valida se todas as inscrições são guest ou não são
    // é necesario pra não fazer pagamento de inscrições misturadas
    const allGuests = inscriptions.every((i) => i.getIsGuest());
    const noneGuests = inscriptions.every((i) => !i.getIsGuest());
    if (!allGuests && !noneGuests) {
      throw new InvalidInscriptionIdUsecaseException(
        'Failed to register payment because guest and non-guest inscriptions were mixed in the same payment request',
        'Não é permitido misturar inscrições guest com não guest',
        RegisterPaymentAdminUsecase.name,
      );
    }

    // Validação de valores alocados
    const amountTotal = input.inscriptions.reduce(
      (sum, i) => sum + (i.amount ?? 0),
      0,
    );
    if (amountTotal > input.amount) {
      throw new PaymentAllocationExceededUsecaseException(
        `Allocated amount (${amountTotal}) exceeds paid amount (${input.amount})`,
        'O valor distribuído ultrapassa o valor pago.',
        'RegisterPaymentAdminUsecase',
      );
    }
    this.validateAllocationAmounts(input, inscriptions);

    // upload da imagem para o supabase
    const imagePath = await this.processEventImage(
      input.image,
      eventId,
      input.amount,
      input.isGuest,
      input.accountId,
      input.guestName,
    );

    // cria o pagamento em memoria
    const payment = Payment.create({
      eventId,
      accountId: input.isGuest ? undefined : input.accountId,
      guestName: input.isGuest ? input.guestName : undefined,
      isGuest: input.isGuest,
      status: StatusPayment.APPROVED,
      totalValue: input.amount,
      totalPaid: input.amount,
      totalNetValue: input.amount,
      totalReceived: input.amount,
      installment: 1,
      paidInstallments: 1,
      imageUrls: [imagePath], // Agora é um array com uma única imagem
      methodPayment: PaymentMethod.PIX,
      approvedBy: input.userId,
    });

    const { financialMovement, paymentInstallment } =
      this.buildApprovalFinancialData(payment);

    // cria as alocações e atualização das inscrições em memória
    const allocations = this.buildAllocations(input, inscriptions, payment);
    const updatedInscriptions = this.applyPaymentsToInscriptions(
      allocations,
      inscriptions,
    );

    // preparar dados de caixa
    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(eventId);
    const cashRegisterEntries = this.buildCashRegisterEntries(
      cashRegisterEvents,
      payment,
      paymentInstallment,
      input.userId,
    );
    const updatedCashRegisters = cashRegisterEntries.length
      ? await this.buildUpdatedCashRegisters(cashRegisterEntries)
      : [];

    // atualizar o evento em memória (valores e participantes)
    event.addCollectedAmount(payment.getTotalPaid());
    event.addNetValueCollected(payment.getTotalNetValue());

    // somar participantes das inscrições que foram pagas
    const paidInscriptionIds = updatedInscriptions
      .filter((ins) => ins.getStatus() === InscriptionStatus.PAID)
      .map((ins) => ins.getId());
    const totalParticipantsToAdd =
      await this.sumParticipantsForInscriptions(paidInscriptionIds);
    for (let i = 0; i < totalParticipantsToAdd; i++) {
      event.addParticipant();
    }

    await this.prisma.runInTransaction(async (tx) => {
      await this.paymentGateway.createTx(payment, tx);
      await this.financialMovementGateway.createTx(financialMovement, tx);
      await this.paymentInstallmentGateway.createTx(paymentInstallment, tx);

      // cria as alocações em lote
      for (const allocation of allocations) {
        await this.paymentAllocationGateway.createTx(allocation, tx);
      }

      // Atualiza as inscrições em lote
      for (const inscription of updatedInscriptions) {
        await this.inscriptionGateway.updateTx(inscription, tx);
      }

      // se encontrar caixa referente ao evento, então cria as entradas e atualiza o caixa
      if (cashRegisterEntries.length) {
        await this.cashRegisterEntryGateway.createManyTx(
          cashRegisterEntries,
          tx,
        );

        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      } else {
        this.logger.warn(`Nenhum caixa encontrado para o evento ${eventId}`);
      }

      await this.eventGateway.updateTx(event, tx);
    });

    this.logger.log(`Pagamento registrado: R$ ${payment.getTotalValue()}`);

    return {
      inscriptions: inscriptions.map((i) => ({
        id: i.getId(),
        status: i.getStatus(),
      })),
    };
  }

  private validateAllocationAmounts(
    input: RegisterPaymentAdminInput,
    inscriptions: Inscription[],
  ): void {
    let totalAllocated = 0;
    for (const inv of input.inscriptions) {
      if (inv.amount == null) continue;
      const inscription = inscriptions.find((i) => i.getId() === inv.id);
      if (!inscription) continue;
      const remainingDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );
      if (inv.amount > remainingDebt) {
        throw new OverpaymentNotAllowedUsecaseException(
          `Amount ${inv.amount} exceeds debt ${remainingDebt}`,
          'Valor alocado ultrapassa o débito da inscrição',
          RegisterPaymentAdminUsecase.name,
        );
      }
      totalAllocated += inv.amount;
    }
    if (totalAllocated > input.amount) {
      throw new OverpaymentNotAllowedUsecaseException(
        `Total allocated ${totalAllocated} > payment ${input.amount}`,
        'Soma dos valores alocados ultrapassa o valor do pagamento',
        RegisterPaymentAdminUsecase.name,
      );
    }
  }

  private buildApprovalFinancialData(payment: Payment): {
    financialMovement: FinancialMovement;
    paymentInstallment: PaymentInstallment;
  } {
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(payment.getTotalValue()),
    });
    const paymentInstallment = PaymentInstallment.create({
      paymentId: payment.getId(),
      installmentNumber: 1,
      received: true,
      value: payment.getTotalValue(),
      netValue: payment.getTotalValue(),
      financialMovementId: financialMovement.getId(),
      paidAt: new Date(),
      estimatedAt: new Date(),
    });
    payment.addPaidInstallment(
      paymentInstallment.getValue(),
      paymentInstallment.getNetValue(),
    );
    payment.setTotalReceived(paymentInstallment.getNetValue());
    return { financialMovement, paymentInstallment };
  }

  private buildAllocations(
    input: RegisterPaymentAdminInput,
    inscriptions: Inscription[],
    payment: Payment,
  ): PaymentAllocation[] {
    const allocations: PaymentAllocation[] = [];
    const inscriptionMap = new Map(inscriptions.map((i) => [i.getId(), i]));

    // Ordena pelo índice se fornecido, senão mantém ordem do input
    const sortedInscriptions = [...input.inscriptions].sort(
      (a, b) => (a.index ?? 0) - (b.index ?? 0),
    );

    let remainingValue = input.amount;
    for (const inv of sortedInscriptions) {
      const inscription = inscriptionMap.get(inv.id);
      if (!inscription) continue;

      const remainingDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );
      let allocationValue = 0;
      if (inv.amount != null) {
        allocationValue = Math.min(inv.amount, remainingValue);
      } else {
        allocationValue = Math.min(remainingDebt, remainingValue);
      }

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
    return allocations;
  }

  private applyPaymentsToInscriptions(
    allocations: PaymentAllocation[],
    inscriptions: Inscription[],
  ): Inscription[] {
    const updated: Inscription[] = [];
    const inscriptionMap = new Map(inscriptions.map((i) => [i.getId(), i]));

    for (const allocation of allocations) {
      const inscription = inscriptionMap.get(allocation.getInscriptionId());
      if (!inscription) continue;
      inscription.incrementeValuePaid(allocation.getValue());
      if (
        inscription.getTotalPaid() >= inscription.getTotalValue() &&
        inscription.getStatus() !== InscriptionStatus.PAID
      ) {
        inscription.inscriptionPaid();
        this.logger.log(
          `Inscrição: ID: ${inscription.getId()} foi marcada como PAID`,
        );
      }
      if (!updated.includes(inscription)) updated.push(inscription);
    }
    return updated;
  }

  private buildCashRegisterEntries(
    cashRegisterEvents: CashRegisterEvent[],
    payment: Payment,
    paymentInstallment: PaymentInstallment,
    accountId: string,
  ): CashRegisterEntry[] {
    const paymentImages = payment.getImageUrls(); // Retorna string[]
    return cashRegisterEvents.map((cashRegisterEvent) =>
      CashRegisterEntry.create({
        cashRegisterId: cashRegisterEvent.getCashRegisterId(),
        type: CashEntryType.INCOME,
        origin: CashEntryOrigin.INTERNAL,
        method: PaymentMethod.PIX,
        value: paymentInstallment.getNetValue(),
        description: `Pagamento PIX parcela ${paymentInstallment.getInstallmentNumber()} de ${payment.getInstallments()} - ${payment.getId()}`,
        eventId: payment.getEventId(),
        paymentInstallmentId: paymentInstallment.getId(),
        responsible: accountId,
        imageUrls: paymentImages, // Passa o array diretamente
      }),
    );
  }

  private async buildUpdatedCashRegisters(
    entries: CashRegisterEntry[],
  ): Promise<CashRegister[]> {
    const deltaMap = new Map<string, number>();
    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      deltaMap.set(id, (deltaMap.get(id) ?? 0) + entry.getValue());
    }

    const updated: CashRegister[] = [];
    for (const [cashRegisterId, delta] of deltaMap.entries()) {
      if (delta === 0) continue;
      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;
      cashRegister.incrementBalance(delta);
      updated.push(cashRegister);
    }
    return updated;
  }

  private async sumParticipantsForInscriptions(
    inscriptionIds: string[],
  ): Promise<number> {
    let total = 0;
    for (const id of inscriptionIds) {
      total += await this.inscriptionGateway.countParticipants(id);
    }
    return total;
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
