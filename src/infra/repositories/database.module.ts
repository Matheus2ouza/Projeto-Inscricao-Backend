import { Module } from '@nestjs/common';
import { AccountParticipantInEventPrismaRepositoryProvider } from './prisma/account-participant-in-event/model/account-participant-in-event.prisma.repository.provider';
import { AccountParticipantPrismaRepositoryProvider } from './prisma/account-participant/model/account-participant.prisma.repository.provider';
import { AccountPrismaRepositoryProvider } from './prisma/account/model/account.prisma.repository.provider';
import { CashRegisterEntryPrismaRepositoryProvider } from './prisma/cash-register-entry/model/cash-register-entry.prisma.repository.provider';
import { CashRegisterEventPrismaRepositoryProvider } from './prisma/cash-register-event/model/cash-register-event.prisma.repository.provider';
import { CashRegisterPrismaRepositoryProvider } from './prisma/cash-register/model/cash-register.prisma.repository.provider';
import { CashRegisterTransferPrismaRepositoryProvider } from './prisma/cash-register-transfer/model/cash-register-transfer.prisma.repository.provider';
import { EventExpensesPrismaRepositoryProvider } from './prisma/event-expenses/model/event-expenses.prisma.repository.provider';
import { EventResponsiblePrismaRepositoryProvider } from './prisma/event-responsibles/model/event-responsibles.prisma.repository.provider';
import { EventTicketPrismaRepositoryProvider } from './prisma/event-tickets/model/event-tickets.prisma.repository.provider';
import { EventPrismaRepositoryProvider } from './prisma/event/model/event.prisma.repository.provider';
import { FinancialMovementPrismaRepositoryProvider } from './prisma/financial-movement/model/financial-movement.repository.provider';
import { InscriptionPrismaRepositoryProvider } from './prisma/inscription/model/inscription.prisma.repository.provider';
import { OnSiteParticipantPaymentPrismaRepositoryProvider } from './prisma/on-site-participant-payment/model/on-site-participant-payment.repository.provider';
import { OnSiteParticipantPrismaRepositoryProvider } from './prisma/on-site-participant/model/on-site-participant.repository.provider';
import { OnSiteRegistrationPrismaRepositoryProvider } from './prisma/on-site-registration/model/on-site-registration.prisma.repository.provider';
import { ParticipantPrismaRepositoryProvider } from './prisma/participant/model/participant.prisma.repository.provider';
import { PaymentAllocationPrismaRepositoryProvider } from './prisma/payment-allocation/model/payment-allocation.prisma.repository.provider';
import { PaymentInstallmentPrismaRepositoryProvider } from './prisma/payment-installment/model/payment-installment.repository.provider';
import { PaymentLinkPrismaRepositoryProvider } from './prisma/payment-link/model/payment-link.prisma.repository.provider';
import { PaymentPrismaRepositoryProvider } from './prisma/payment/model/payment.prisma.repository.provider';
import { PrismaModule } from './prisma/prisma.module';
import { RegionPrismaRepositoryProvider } from './prisma/region/model/region.prisma.repository.provider';
import { TicketSaleItemPrismaRepositoryProvider } from './prisma/ticket-sale-item/model/ticket-sale-item.prisma.repository.provider';
import { TicketSalePaymentPrismaRepositoryProvider } from './prisma/ticket-sale-payment/model/ticket-sale-payment.prisma.repository.provider';
import { TicketSalePrismaRepositoryProvider } from './prisma/ticket-sale/model/ticket-sale.prisma.repository.provider';
import { TicketUnitPrismaRepositoryProvider } from './prisma/ticket-unit/model/ticket-unit.prisma.repository.provider';
import { TypeInscriptionPrismaRepositoryProvider } from './prisma/type-inscription/model/type-inscription.prisma.repository.provider';

@Module({
  imports: [PrismaModule],
  providers: [
    AccountPrismaRepositoryProvider,
    AccountParticipantPrismaRepositoryProvider,
    AccountParticipantInEventPrismaRepositoryProvider,
    CashRegisterPrismaRepositoryProvider,
    CashRegisterEntryPrismaRepositoryProvider,
    CashRegisterEventPrismaRepositoryProvider,
    CashRegisterTransferPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
    InscriptionPrismaRepositoryProvider,
    ParticipantPrismaRepositoryProvider,
    PaymentPrismaRepositoryProvider,
    PaymentAllocationPrismaRepositoryProvider,
    PaymentInstallmentPrismaRepositoryProvider,
    PaymentLinkPrismaRepositoryProvider,
    FinancialMovementPrismaRepositoryProvider,
    EventTicketPrismaRepositoryProvider,
    EventResponsiblePrismaRepositoryProvider,
    TicketSalePrismaRepositoryProvider,
    TicketSaleItemPrismaRepositoryProvider,
    OnSiteParticipantPrismaRepositoryProvider,
    OnSiteParticipantPaymentPrismaRepositoryProvider,
    OnSiteRegistrationPrismaRepositoryProvider,
    EventExpensesPrismaRepositoryProvider,
    TicketSalePaymentPrismaRepositoryProvider,
    TicketUnitPrismaRepositoryProvider,
  ],
  exports: [
    AccountPrismaRepositoryProvider,
    AccountParticipantPrismaRepositoryProvider,
    AccountParticipantInEventPrismaRepositoryProvider,
    CashRegisterPrismaRepositoryProvider,
    CashRegisterEntryPrismaRepositoryProvider,
    CashRegisterEventPrismaRepositoryProvider,
    CashRegisterTransferPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
    InscriptionPrismaRepositoryProvider,
    ParticipantPrismaRepositoryProvider,
    PaymentPrismaRepositoryProvider,
    PaymentInstallmentPrismaRepositoryProvider,
    PaymentLinkPrismaRepositoryProvider,
    PaymentAllocationPrismaRepositoryProvider,
    FinancialMovementPrismaRepositoryProvider,
    EventTicketPrismaRepositoryProvider,
    EventResponsiblePrismaRepositoryProvider,
    TicketSalePrismaRepositoryProvider,
    TicketSaleItemPrismaRepositoryProvider,
    OnSiteParticipantPrismaRepositoryProvider,
    OnSiteParticipantPaymentPrismaRepositoryProvider,
    OnSiteRegistrationPrismaRepositoryProvider,
    EventExpensesPrismaRepositoryProvider,
    TicketSalePaymentPrismaRepositoryProvider,
    TicketUnitPrismaRepositoryProvider,
  ],
})
export class DataBaseModule {}
