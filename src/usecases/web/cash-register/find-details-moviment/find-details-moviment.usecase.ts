import { Injectable } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  genderType,
  InscriptionStatus,
  PaymentMethod,
  TicketSaleStatus,
} from 'generated/prisma';
import { Account } from 'src/domain/entities/account.entity';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { CashRegisterNotFoundUsecaseException } from '../../exceptions/cash-register/cash-register-not-found.usecase.exception';

export type FindDetailsMovimentInput = {
  id: string;
};

export type FindDetailsMovimentOutput = {
  id: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  responsible?: string;
  imageUrl?: string;
  createdAt: Date;
  reference: Reference;
};

type Reference =
  | InscriptionReference
  | OnSiteRegistrationReference
  | EventExpenseReference
  | TicketSaleReference
  | UnknownReference;

type ReferenceParticipant = {
  name: string;
  preferredName?: string;
  birthDate: Date;
  gender: genderType;
};

type InscriptionReference = {
  kind: 'INSCRIPTION';
  paymentInstallmentId: string;
  inscription?: {
    id: string;
    eventId: string;
    status: InscriptionStatus;
    totalValue: number;
    totalPaid: number;
    isGuest: boolean;
    guestName?: string;
    guestEmail?: string;
    createdAt: Date;
    participants: ReferenceParticipant[];
  };
};

type OnSiteRegistrationReference = {
  kind: 'ONSITE_REGISTRATION';
  onSiteRegistrationId: string;
  onSiteRegistration?: {
    id: string;
    eventId: string;
    status: InscriptionStatus;
    totalValue: number;
    responsible: string;
    createdAt: Date;
  };
};

type EventExpenseReference = {
  kind: 'EVENT_EXPENSE';
  eventExpenseId: string;
  eventExpense?: {
    id: string;
    eventId: string;
    description: string;
    value: number;
    paymentMethod: PaymentMethod;
    responsible: string;
    createdAt: Date;
  };
};

type TicketSaleReference = {
  kind: 'TICKET_SALE';
  ticketSaleId: string;
  ticketSale?: {
    id: string;
    eventId: string;
    status: TicketSaleStatus;
    name: string;
    email?: string;
    phone?: string;
    totalValue: number;
    createdAt: Date;
  };
};

type UnknownReference = {
  kind: 'UNKNOWN';
  id: string;
};

@Injectable()
export class FindDetailsMovimentUsecase
  implements Usecase<FindDetailsMovimentInput, FindDetailsMovimentOutput>
{
  constructor(
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly userGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
  ) {}

  async execute(
    input: FindDetailsMovimentInput,
  ): Promise<FindDetailsMovimentOutput> {
    const moviment = await this.cashRegisterEntryGateway.findById(input.id);

    if (!moviment) {
      throw new CashRegisterNotFoundUsecaseException(
        `Attempt to retrieve transaction data: ${input.id}, but the transaction was not found.`,
        `Movimentação não encontrada.`,
        FindDetailsMovimentUsecase.name,
      );
    }

    let responsible: Account | null = null;
    if (
      moviment.getOrigin() !== CashEntryOrigin.ASAAS &&
      moviment.getResponsible()
    ) {
      responsible = await this.userGateway.findById(moviment.getResponsible()!);
    }

    const paymentInstallmentId = moviment.getPaymentInstallmentId();
    const onSiteRegistrationId = moviment.getOnSiteRegistrationId();
    const eventExpenseId = moviment.getEventExpenseId();
    const ticketSaleId = moviment.getTicketSaleId();

    const reference = await this.resolveReference({
      paymentInstallmentId,
      onSiteRegistrationId,
      eventExpenseId,
      ticketSaleId,
      fallbackId: moviment.getId(),
    });

    const output: FindDetailsMovimentOutput = {
      id: moviment.getId(),
      type: moviment.getType(),
      origin: moviment.getOrigin(),
      method: moviment.getMethod(),
      value: moviment.getValue(),
      description: moviment.getDescription(),
      eventId: moviment.getEventId(),
      paymentInstallmentId,
      onSiteRegistrationId,
      eventExpenseId,
      ticketSaleId,
      responsible: responsible?.getUsername() || moviment.getResponsible(),
      imageUrl: await this.getPublicUrl(moviment.getImageUrl()),
      createdAt: moviment.getCreatedAt(),
      reference,
    };

    return output;
  }

  private async resolveReference(input: {
    paymentInstallmentId?: string;
    onSiteRegistrationId?: string;
    eventExpenseId?: string;
    ticketSaleId?: string;
    fallbackId: string;
  }): Promise<Reference> {
    if (input.paymentInstallmentId) {
      const base: InscriptionReference = {
        kind: 'INSCRIPTION',
        paymentInstallmentId: input.paymentInstallmentId,
      };

      const installment = await this.paymentInstallmentGateway.findById(
        input.paymentInstallmentId,
      );
      if (!installment) return base;

      const payment = await this.paymentGateway.findById(
        installment.getPaymentId(),
      );
      if (!payment) return base;

      const allocations = await this.paymentAllocationGateway.findByPaymentId(
        payment.getId(),
      );
      if (allocations.length === 0) return base;

      const inscription = await this.inscriptionGateway.findById(
        allocations[0].getInscriptionId(),
      );
      if (!inscription) return base;

      const participants: ReferenceParticipant[] = inscription.getIsGuest()
        ? (
            await this.participantGateway.findByInscriptionId(
              inscription.getId(),
            )
          ).map((p) => ({
            name: p.getName(),
            preferredName: p.getPreferredName(),
            birthDate: p.getBirthDate(),
            gender: p.getGender(),
          }))
        : (
            await this.accountParticipantGateway.findByInscriptionId(
              inscription.getId(),
            )
          ).map((p) => ({
            name: p.getName(),
            preferredName: p.getPreferredName(),
            birthDate: p.getBirthDate(),
            gender: p.getGender(),
          }));

      return {
        ...base,
        inscription: {
          id: inscription.getId(),
          eventId: inscription.getEventId(),
          status: inscription.getStatus(),
          totalValue: inscription.getTotalValue(),
          totalPaid: inscription.getTotalPaid(),
          isGuest: inscription.getIsGuest(),
          guestName: inscription.getGuestName(),
          guestEmail: inscription.getGuestEmail(),
          createdAt: inscription.getCreatedAt(),
          participants,
        },
      };
    }

    if (input.onSiteRegistrationId) {
      const base: OnSiteRegistrationReference = {
        kind: 'ONSITE_REGISTRATION',
        onSiteRegistrationId: input.onSiteRegistrationId,
      };

      const registration = await this.onSiteRegistrationGateway.findById(
        input.onSiteRegistrationId,
      );
      if (!registration) return base;

      return {
        ...base,
        onSiteRegistration: {
          id: registration.getId(),
          eventId: registration.getEventId(),
          status: registration.getStatus(),
          totalValue: Number(registration.getTotalValue()),
          responsible: registration.getResponsible(),
          createdAt: registration.getCreatedAt(),
        },
      };
    }

    if (input.eventExpenseId) {
      const base: EventExpenseReference = {
        kind: 'EVENT_EXPENSE',
        eventExpenseId: input.eventExpenseId,
      };

      const expense = await this.eventExpensesGateway.findById(
        input.eventExpenseId,
      );
      if (!expense) return base;

      return {
        ...base,
        eventExpense: {
          id: expense.getId(),
          eventId: expense.getEventId(),
          description: expense.getDescription(),
          value: expense.getValue(),
          paymentMethod: expense.getPaymentMethod(),
          responsible: expense.getResponsible(),
          createdAt: expense.getCreatedAt(),
        },
      };
    }

    if (input.ticketSaleId) {
      const base: TicketSaleReference = {
        kind: 'TICKET_SALE',
        ticketSaleId: input.ticketSaleId,
      };

      const sale = await this.ticketSaleGateway.findById(input.ticketSaleId);
      if (!sale) return base;

      return {
        ...base,
        ticketSale: {
          id: sale.getId(),
          eventId: sale.getEventId(),
          status: sale.getStatus(),
          name: sale.getName(),
          email: sale.getEmail(),
          phone: sale.getPhone(),
          totalValue: sale.getTotalValue(),
          createdAt: sale.getCreatedAt(),
        },
      };
    }

    return { kind: 'UNKNOWN', id: input.fallbackId };
  }

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }
}
