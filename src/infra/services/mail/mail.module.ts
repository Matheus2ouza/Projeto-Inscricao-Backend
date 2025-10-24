import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { InscriptionEmailHandler } from './handlers/inscription-email.handler';
import { MailService } from './mail.service';

@Module({
  imports: [RedisModule, SupabaseModule],
  providers: [MailService, InscriptionEmailHandler],
  exports: [MailService, InscriptionEmailHandler],
})
export class MailModule {}
