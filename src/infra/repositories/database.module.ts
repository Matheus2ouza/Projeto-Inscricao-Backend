import { Module } from '@nestjs/common';
import { CacheRecordRepositoryProvider } from './prisma/cache-record/cache-record.prisma.repository.provider';
import { EventExpensesPrismaRepositoryProvider } from './prisma/event-expenses/model/event-expenses.prisma.repository.provider';
import { EventTicketPrismaRepositoryProvider } from './prisma/event-tickets/model/event-tickets.prisma.repository.provider';
import { EventPrismaRepositoryProvider } from './prisma/event/model/event.prisma.repository.provider';
import { FinancialMovementPrismaRepositoryProvider } from './prisma/financial-movement/model/financial-movement.repository.provider';
import { InscriptionPrismaRepositoryProvider } from './prisma/inscription/model/inscription.prisma.repository.provider';
import { OnSiteParticipantPaymentPrismaRepositoryProvider } from './prisma/on-site-participant-payment/model/on-site-participant-payment.repository.provider';
import { OnSiteParticipantPrismaRepositoryProvider } from './prisma/on-site-participant/model/on-site-participant.repository.provider';
import { OnSiteRegistrationPrismaRepositoryProvider } from './prisma/on-site-registration/model/on-site-registration.prisma.repository.provider';
import { ParticipantPrismaRepositoryProvider } from './prisma/participant/model/participant.prisma.repository.provider';
import { PaymentInscriptionRepositoryProvider } from './prisma/payment-inscription/model/payment-inscription.prisma.repository.provider';
import { PrismaService } from './prisma/prisma.service';
import { RegionPrismaRepositoryProvider } from './prisma/region/region.prisma.repository.provider';
import { TicketSalePrismaRepositoryProvider } from './prisma/ticket-sale/model/ticket-sale.prisma.repository.provider';
import { TypeInscriptionPrismaRepositoryProvider } from './prisma/type-inscription/type-inscription.prisma.repository.provider';
import { UserPrismaRepositoryProvider } from './prisma/user/model/user.prisma.repository.provider';

@Module({
  providers: [
    PrismaService,
    UserPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
    InscriptionPrismaRepositoryProvider,
    ParticipantPrismaRepositoryProvider,
    CacheRecordRepositoryProvider,
    PaymentInscriptionRepositoryProvider,
    FinancialMovementPrismaRepositoryProvider,
    EventTicketPrismaRepositoryProvider,
    TicketSalePrismaRepositoryProvider,
    OnSiteParticipantPrismaRepositoryProvider,
    OnSiteParticipantPaymentPrismaRepositoryProvider,
    OnSiteRegistrationPrismaRepositoryProvider,
    EventExpensesPrismaRepositoryProvider,
  ],
  exports: [
    PrismaService,
    UserPrismaRepositoryProvider,
    EventPrismaRepositoryProvider,
    RegionPrismaRepositoryProvider,
    TypeInscriptionPrismaRepositoryProvider,
    InscriptionPrismaRepositoryProvider,
    ParticipantPrismaRepositoryProvider,
    CacheRecordRepositoryProvider,
    PaymentInscriptionRepositoryProvider,
    FinancialMovementPrismaRepositoryProvider,
    EventTicketPrismaRepositoryProvider,
    TicketSalePrismaRepositoryProvider,
    OnSiteParticipantPrismaRepositoryProvider,
    OnSiteParticipantPaymentPrismaRepositoryProvider,
    OnSiteRegistrationPrismaRepositoryProvider,
    EventExpensesPrismaRepositoryProvider,
  ],
})
export class DataBaseModule {}
