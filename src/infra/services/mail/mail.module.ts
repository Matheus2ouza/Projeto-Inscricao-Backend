import { Module } from '@nestjs/common';
import { DataBaseModule } from 'src/infra/repositories/database.module';
import { RedisModule } from '../redis/redis.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { InscriptionEmailHandler } from './handlers/inscription/inscription-email.handler';
import { PaymentApprovedEmailHandler } from './handlers/payment/payment-approved-email.handler';
import { PaymentRejectedEmailHandler } from './handlers/payment/payment-rejected-email.handler';
import { MailService } from './mail.service';

@Module({
  imports: [RedisModule, SupabaseModule, DataBaseModule],
  providers: [
    MailService,

    //Inscription
    InscriptionEmailHandler,

    //Payments
    //Approved
    PaymentApprovedEmailHandler,
    //Rejected
    PaymentRejectedEmailHandler,
  ],
  exports: [
    MailService,

    //Inscription
    InscriptionEmailHandler,

    //Payments
    //Approved
    PaymentApprovedEmailHandler,
    //Rejected
    PaymentRejectedEmailHandler,
  ],
})
export class MailModule {}
