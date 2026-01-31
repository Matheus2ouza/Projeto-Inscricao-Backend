import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { RedisModule } from '../redis/redis.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { GuestInscriptionEmailHandler } from './handlers/inscription/guest-inscription-email.handler';
import { InscriptionEmailHandler } from './handlers/inscription/inscription-email.handler';
import { InscriptionStatusEmailHandler } from './handlers/inscription/inscription-status-email.handler';
import { PaymentApprovedEmailHandler } from './handlers/payment/payment-approved-email.handler';
import { PaymentRejectedEmailHandler } from './handlers/payment/payment-rejected-email.handler';
import { PaymentReviewNotificationEmailHandler } from './handlers/payment/payment-review-notification-email.handler';
import { TicketSaleNotificationEmailHandler } from './handlers/tickets/ticket-sale-notification-email.handler';
import { MailService } from './mail.service';

@Module({
  imports: [RedisModule, SupabaseModule, DataBaseModule],
  providers: [
    MailService,

    //Inscription
    InscriptionEmailHandler,
    InscriptionStatusEmailHandler,
    GuestInscriptionEmailHandler,

    //Payments
    PaymentApprovedEmailHandler,
    PaymentRejectedEmailHandler,
    PaymentReviewNotificationEmailHandler,

    // Tickets
    TicketSaleNotificationEmailHandler,
  ],
  exports: [
    MailService,

    //Inscription
    InscriptionEmailHandler,
    InscriptionStatusEmailHandler,
    GuestInscriptionEmailHandler,

    //Payments
    //Approved
    PaymentApprovedEmailHandler,
    //Rejected
    PaymentRejectedEmailHandler,
    //Under review
    PaymentReviewNotificationEmailHandler,

    // Tickets
    TicketSaleNotificationEmailHandler,
  ],
})
export class MailModule {}
