import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
  TransactionType,
} from 'generated/prisma';
import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { Participant } from 'src/domain/entities/participant.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';

export type CreateInscriptionAdminInput = {
  // Id do admin que fez a inscrição
  userId: string;

  eventId: string;

  // O admin pode setar o status da inscrição
  status: InscriptionStatus;

  // para ver se é inscrição Guest
  isGuest: boolean;

  // Dados Normais
  accountId?: string;
  responsible: string;
  email: string;
  phone: string;

  // Dados Guest
  guestLocality?: string;

  totalValue: number;
  totalPaid?: number;

  participants: ParticipantInscription[];
  // Pode já vir com o pagamento entao é opcional
  payment?: PaymentInscription;
};

export type ParticipantInscription = {
  // Se for normal envia somente os dados do membro
  accountParticipantId?: string;

  // Se for Guest envia os dados do Participante
  name?: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate?: string;
  cpf?: string;
  gender?: genderType;

  // Unico dado que é obrigatório em ambas as situações
  typeInscriptionId: string;
};

export type PaymentInscription = {
  // Se for pagamento de inscrição normal
  accountId?: string;

  // Se for pagamento Guest
  guestName?: string;
  guestEmail?: string;

  status: StatusPayment;
  methodPayment: PaymentMethod;

  totalValue?: number;
  totalPaid?: number;
  installment?: number;

  image?: string;
};

export type CreateInscriptionAdminOutput = {
  id: string;
};

@Injectable()
export class CreateInscriptionAdminUsecase
  implements Usecase<CreateInscriptionAdminInput, CreateInscriptionAdminOutput>
{
  private readonly logger = new Logger(CreateInscriptionAdminUsecase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly accountGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  async execute(
    input: CreateInscriptionAdminInput,
  ): Promise<CreateInscriptionAdminOutput> {
    this.logger.log(
      `Iniciando criação de inscrição para evento: ${input.eventId}`,
    );
    this.logger.debug(
      `Input recebido: ${JSON.stringify({
        ...input,
        payment: input.payment
          ? {
              ...input.payment,
              image: input.payment.image ? '[IMAGEM BASE64]' : undefined,
            }
          : undefined,
      })}`,
    );

    // Buscar evento
    this.logger.log(`Buscando evento com ID: ${input.eventId}`);
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      this.logger.error(`Evento não encontrado com ID: ${input.eventId}`);
      throw new EventNotFoundUsecaseException(
        `Attemped to create inscription for non-existent event with ID: ${input.eventId}`,
        `Evento não encontrado`,
        CreateInscriptionAdminUsecase.name,
      );
    }
    this.logger.log(
      `Evento encontrado: ${event.getName()} (ID: ${event.getId()})`,
    );

    // Criar inscrição
    this.logger.log('Criando entidade de inscrição');
    const inscription = Inscription.create({
      accountId: input.accountId,
      eventId: event.getId(),
      guestEmail: input.isGuest ? input.email : undefined,
      guestName: input.isGuest ? input.responsible : undefined,
      guestLocality: input.guestLocality,
      isGuest: input.isGuest,
      responsible: input.responsible,
      phone: input.phone,
      totalValue: input.totalValue,
      totalPaid: input.totalPaid,
      status: input.status,
      email: input.email,
    });
    this.logger.log(
      `Inscrição criada com ID temporário: ${inscription.getId()}`,
    );
    this.logger.log(JSON.stringify(inscription, null, 2));

    // Salvar inscrição
    this.logger.log('Salvando inscrição no banco de dados');
    await this.inscriptionGateway.create(inscription);
    this.logger.log(`Inscrição salva com ID: ${inscription.getId()}`);

    // Processar participantes baseado no tipo de inscrição
    if (!inscription.getIsGuest()) {
      this.logger.log('Processando participantes do tipo NORMAL');
      this.logger.debug(
        `Quantidade de participantes NORMAL: ${input.participants.length}`,
      );

      const participants = await Promise.all(
        input.participants.map(async (p, index) => {
          this.logger.log(
            `Processando participante guest ${index + 1}/${input.participants.length}`,
          );
          this.logger.debug(
            `Buscando tipo de inscrição ID: ${p.typeInscriptionId}`,
          );

          const typeInscription = await this.typeInscriptionGateway.findById(
            p.typeInscriptionId,
          );

          if (!typeInscription) {
            this.logger.error(
              `Tipo de inscrição não encontrado: ${p.typeInscriptionId}`,
            );
            throw new TypeInscriptionNotFoundUsecaseException(
              `Attemped to create inscription for non-existent type inscription with ID: ${p.typeInscriptionId}`,
              `Um dos participantes informados não possui um tipo de inscrição válido`,
              CreateInscriptionAdminUsecase.name,
            );
          }
          this.logger.log(
            `Tipo de inscrição encontrado: ${typeInscription.getDescription()}`,
          );

          return AccountParticipantInEvent.create({
            accountParticipantId: p.accountParticipantId!,
            inscriptionId: inscription.getId(),
            typeInscriptionId: typeInscription.getId(),
          });
        }),
      );

      this.logger.log(
        `Criando ${participants.length} participantes NORMAL no banco`,
      );
      await this.accountParticipantInEventGateway.createMany(participants);
      this.logger.log('Participantes NORMAL criados com sucesso');
    }

    if (inscription.getIsGuest()) {
      this.logger.log('Processando participantes do tipo GUEST');
      this.logger.debug(
        `Quantidade de participantes GUEST: ${input.participants.length}`,
      );

      const participants = await Promise.all(
        input.participants.map(async (p, index) => {
          this.logger.log(
            `Processando participante GUEST ${index + 1}/${input.participants.length}`,
          );
          this.logger.debug(
            `Buscando tipo de inscrição ID: ${p.typeInscriptionId}`,
          );

          const typeInscription = await this.typeInscriptionGateway.findById(
            p.typeInscriptionId,
          );

          if (!typeInscription) {
            this.logger.error(
              `Tipo de inscrição não encontrado: ${p.typeInscriptionId}`,
            );
            throw new TypeInscriptionNotFoundUsecaseException(
              `Attemped to create inscription for non-existent type inscription with ID: ${p.typeInscriptionId}`,
              `Um dos participantes informados não possui um tipo de inscrição válido`,
              CreateInscriptionAdminUsecase.name,
            );
          }
          this.logger.log(
            `Tipo de inscrição encontrado: ${typeInscription.getDescription()}`,
          );

          return Participant.create({
            inscriptionId: inscription.getId(),
            typeInscriptionId: typeInscription.getId(),
            name: p.name!,
            preferredName: p.preferredName,
            shirtSize: p.shirtSize,
            shirtType: p.shirtType,
            birthDate: new Date(p.birthDate!),
            cpf: p.cpf!,
            gender: p.gender!,
          });
        }),
      );

      this.logger.log(
        `Criando ${participants.length} participantes GUEST no banco`,
      );
      await this.participantGateway.createMany(participants);
      this.logger.log('Participantes GUEST criados com sucesso');
    }

    // Processar pagamento se existir
    if (input.payment) {
      this.logger.log('Processando pagamento da inscrição');
      this.logger.debug(`Método de pagamento: ${input.payment.methodPayment}`);
      this.logger.debug(`Status do pagamento: ${input.payment.status}`);

      let imagePath: string | undefined = undefined;
      if (input.payment.methodPayment === PaymentMethod.PIX) {
        this.logger.log('Processando imagem do comprovante PIX');
        this.logger.debug(
          `Imagem recebida: ${input.payment.image ? 'SIM' : 'NÃO'}`,
        );

        imagePath = await this.processEventImage(
          input.payment.image!,
          event.getId(),
          inscription.getTotalValue(),
          inscription.getIsGuest(),
          inscription.getAccountId(),
          inscription.getGuestName(),
        );
        this.logger.log(`Imagem processada e salva em: ${imagePath}`);
      }

      this.logger.log('Criando entidade de pagamento');
      const payment = Payment.create({
        eventId: event.getId(),
        accountId: input.accountId,
        guestName: input.payment.guestName,
        guestEmail: input.payment.guestEmail,
        isGuest: input.isGuest,
        status: input.payment.status,
        totalValue: inscription.getTotalValue(),
        totalPaid: input.payment.totalPaid,
        totalNetValue: input.payment.totalPaid,
        totalReceived: input.payment.totalPaid,
        installment: input.payment.installment || 1,
        paidInstallments: 1,
        imageUrl: imagePath,
        methodPayment: input.payment.methodPayment,
        approvedBy:
          input.payment.status === StatusPayment.APPROVED
            ? input.userId
            : undefined,
      });
      this.logger.log(`Pagamento criado com ID temporário: ${payment.getId()}`);

      this.logger.log('Salvando pagamento no banco de dados');
      await this.paymentGateway.create(payment);
      this.logger.log(`Pagamento salvo com ID: ${payment.getId()}`);

      // Buscar caixa do evento
      this.logger.log(
        `Buscando caixas associados ao evento: ${payment.getEventId()}`,
      );
      const cashRegisterEvent =
        await this.cashRegisterEventGateway.findByEventId(payment.getEventId());
      this.logger.log(
        `Encontrados ${cashRegisterEvent.length} caixas associados ao evento`,
      );

      // Criar parcelas com movimentação financeira
      this.logger.log(
        `Criando ${payment.getInstallments()} parcelas para o pagamento`,
      );

      const installments: PaymentInstallment[] = [];

      for (let index = 0; index < payment.getInstallments(); index++) {
        const installmentNumber = index + 1;
        const value = payment.getTotalPaid() / payment.getInstallments();

        this.logger.debug(
          `Criando parcela ${installmentNumber}/${payment.getInstallments()} - Valor: ${value}`,
        );

        const financialMovement = FinancialMovement.create({
          eventId: payment.getEventId(),
          accountId: payment.getAccountId(),
          type: TransactionType.INCOME,
          value: new Decimal(value),
        });

        await this.financialMovementGateway.create(financialMovement);

        const installment = PaymentInstallment.create({
          paymentId: payment.getId(),
          installmentNumber,
          received: true,
          value,
          netValue: value,
          financialMovementId: financialMovement.getId(),
          paidAt: new Date(),
          estimatedAt: new Date(),
        });

        installments.push(installment);
      }

      this.logger.log(`Salvando ${installments.length} parcelas no banco`);
      await this.paymentInstallmentGateway.createMany(installments);
      this.logger.log('Parcelas salvas com sucesso');

      // Criar entradas no caixa se houver caixas associados
      if (cashRegisterEvent.length > 0) {
        this.logger.log(
          `Criando entradas no caixa para ${cashRegisterEvent.length} caixas`,
        );

        const entries = installments.flatMap((installment) =>
          cashRegisterEvent.map((c) => {
            this.logger.debug(
              `Criando entrada para caixa ${c.getCashRegisterId()}, parcela ${installment.getInstallmentNumber()}`,
            );

            return CashRegisterEntry.create({
              cashRegisterId: c.getCashRegisterId(),
              type: CashEntryType.INCOME,
              origin: CashEntryOrigin.INTERNAL,
              method: payment.getMethodPayment(),
              value: installment.getNetValue(),
              description: `Pagamento ${payment.getMethodPayment()} referente a parcela ${installment.getInstallmentNumber()} de ${payment.getInstallments()} do pagamento ${payment.getId()}`,
              eventId: payment.getEventId(),
              paymentInstallmentId: installment.getId(),
              responsible: input.accountId,
              imageUrl: payment.getImageUrl(),
            });
          }),
        );

        this.logger.log(`Criando ${entries.length} entradas no caixa`);
        await this.cashRegisterEntryGateway.createMany(entries);
        await this.updateCashRegisterBalances(entries);
        // Atualizar valores financeiros do evento
        const totalCollected = installments.reduce(
          (sum, i) => sum + i.getValue(),
          0,
        );
        const totalNetCollected = installments.reduce(
          (sum, i) => sum + i.getNetValue(),
          0,
        );

        event.incrementAmountCollected(totalCollected);
        event.incrementAmountNetValueCollected(totalNetCollected);

        // Atualizar quantidade de participantes
        const quantityParticipants =
          await this.inscriptionGateway.countParticipants(inscription.getId());

        for (let i = 0; i < quantityParticipants; i++) {
          event.incrementParticipantsCount();
        }

        this.logger.log(
          `Evento atualizado - Coletado: R$ ${totalCollected} | Líquido: R$ ${totalNetCollected} | Participantes: +${quantityParticipants}`,
        );
        this.logger.log('Entradas no caixa criadas com sucesso');
      } else {
        this.logger.log(
          'Nenhum caixa associado ao evento - pulando criação de entradas',
        );
      }

      // Criar alocação do pagamento
      this.logger.log('Criando alocação do pagamento para a inscrição');
      const allocation = PaymentAllocation.create({
        paymentId: payment.getId(),
        inscriptionId: inscription.getId(),
        value: payment.getTotalPaid(),
      });

      this.logger.log('Salvando alocação no banco');
      await this.paymentAllocationGateway.create(allocation);
      this.logger.log('Alocação criada com sucesso');
    } else {
      this.logger.log('Nenhum pagamento associado à inscrição');
    }

    this.logger.log(`Inscrição criada com sucesso! ID: ${inscription.getId()}`);

    this.logger.log(`Atualizando o evento!`);
    await this.eventGateway.update(event);

    const output: CreateInscriptionAdminOutput = {
      id: inscription.getId(),
    };

    return output;
  }

  private async processEventImage(
    image: string,
    eventId: string,
    value: number,
    isGuest: boolean,
    accountId?: string,
    guestName?: string,
  ): Promise<string> {
    this.logger.log('=== INICIANDO PROCESSAMENTO DE IMAGEM ===');
    this.logger.log(`Evento ID: ${eventId}`);
    this.logger.log(`Valor: ${value}`);
    this.logger.log(`Tipo: ${isGuest ? 'GUEST' : 'NORMAL'}`);
    this.logger.log(`AccountId: ${accountId || 'NÃO INFORMADO'}`);
    this.logger.log(`GuestName: ${guestName || 'NÃO INFORMADO'}`);

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);
    this.logger.log(
      `Imagem processada - Tamanho: ${buffer.length} bytes, Extensão: ${extension}`,
    );

    // Valida a imagem
    this.logger.log('Validando imagem...');
    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      `payment_${value}.${extension}`,
    );

    if (!isValidImage) {
      this.logger.error('Falha na validação da imagem');
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        CreateInscriptionAdminUsecase.name,
      );
    }
    this.logger.log('Imagem validada com sucesso');

    // Otimiza imagem
    this.logger.log('Otimizando imagem...');
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
    this.logger.log(
      `Imagem otimizada - Formato: ${optimizedImage.format}, Tamanho: ${optimizedImage.buffer.length} bytes`,
    );

    // Busca o nome do evento para incluir no nome do arquivo
    this.logger.log(`Buscando nome do evento: ${eventId}`);
    const eventName = await this.eventGateway.findById(eventId);
    this.logger.log(`Nome do evento encontrado: ${eventName?.getName()}`);

    let accountName;
    if (!isGuest && accountId) {
      //Busca o nome da conta para incluir no nome do arquivo
      this.logger.log(`Buscando nome da conta: ${accountId}`);
      accountName = await this.accountGateway.findById(accountId);
      this.logger.log(
        `Nome da conta encontrado: ${accountName?.getUsername()}`,
      );
    }

    // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(
      eventName?.getName() || 'evento',
    );
    this.logger.log(`Nome do evento sanitizado: ${sanitizedEventName}`);

    // Sanitiza o nome da conta para evitar caracteres inválidos no Supabase
    const sanitizedName = sanitizeFileName(
      guestName || accountName?.getUsername() || 'conta',
    );
    this.logger.log(`Nome sanitizado: ${sanitizedName}`);

    // Cria nome do arquivo: payment+valor+hora formatada
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `payment_${accountId || sanitizedName}_${value}_${formattedDateTime}.${optimizedImage.format}`;
    this.logger.log(`Nome do arquivo gerado: ${fileName}`);

    // Define o nome da pasta com base no tipo de usuário (guest ou normal)
    const folderName = isGuest
      ? `payments/${sanitizedEventName}/guest/${sanitizedName}`
      : `payments/${sanitizedEventName}/normal/${sanitizedName}`;
    this.logger.log(`Pasta de destino: ${folderName}`);

    // Faz upload no Supabase
    this.logger.log('Iniciando upload para o Supabase...');
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: folderName,
      fileName: fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });
    this.logger.log(`Upload concluído! URL: ${imageUrl}`);
    this.logger.log('=== PROCESSAMENTO DE IMAGEM FINALIZADO ===');

    return imageUrl;
  }

  private async updateCashRegisterBalances(
    entries: CashRegisterEntry[],
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

    await Promise.all(
      [...deltaByCashRegisterId.entries()].map(
        async ([cashRegisterId, delta]) => {
          if (delta === 0) return;
          const cashRegister =
            await this.cashRegisterGateway.findById(cashRegisterId);
          if (!cashRegister) return;

          if (delta > 0) {
            cashRegister.incrementBalance(delta);
          } else {
            cashRegister.decrementBalance(-delta);
          }

          await this.cashRegisterGateway.update(cashRegister);
        },
      ),
    );
  }
}
