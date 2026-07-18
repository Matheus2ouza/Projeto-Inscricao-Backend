import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { RedisModule } from '../redis/redis.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { GuestExpiredCleanupEmailHandler } from './handlers/inscription/guest-expired-cleanup-email.handler';
import { GuestExpiredEmailHandler } from './handlers/inscription/guest-expired-email.handler';
import { GuestInscriptionEmailHandler } from './handlers/inscription/guest-inscription-email.handler';
import { InscriptionEmailHandler } from './handlers/inscription/inscription-email.handler';
import { InscriptionStatusEmailHandler } from './handlers/inscription/inscription-status-email.handler';
import { PaymentApprovedEmailHandler } from './handlers/payment/payment-approved-email.handler';
import { PaymentProcessedNotificationEmailHandler } from './handlers/payment/payment-processed-notification-email.handler';
import { PaymentReceiptUpdateEmailHandler } from './handlers/payment/payment-receipt-update-email.handler';
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
    GuestExpiredEmailHandler,
    GuestExpiredCleanupEmailHandler,

    //PAYMENT
    // approved
    PaymentApprovedEmailHandler,
    // rejected
    PaymentRejectedEmailHandler,
    // under review
    PaymentReviewNotificationEmailHandler,
    // receipt update
    PaymentReceiptUpdateEmailHandler,
    // processed success
    PaymentProcessedNotificationEmailHandler,

    // Tickets
    TicketSaleNotificationEmailHandler,
  ],
  exports: [
    MailService,

    //Inscription
    InscriptionEmailHandler,
    InscriptionStatusEmailHandler,
    GuestInscriptionEmailHandler,
    GuestExpiredEmailHandler,
    GuestExpiredCleanupEmailHandler,

    //PAYMENT
    // approved
    PaymentApprovedEmailHandler,
    // rejected
    PaymentRejectedEmailHandler,
    // under review
    PaymentReviewNotificationEmailHandler,
    // receipt update
    PaymentReceiptUpdateEmailHandler,
    // processed success
    PaymentProcessedNotificationEmailHandler,

    // Tickets
    TicketSaleNotificationEmailHandler,
  ],
})
export class MailModule {}
