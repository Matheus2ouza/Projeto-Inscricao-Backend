import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { RedisService } from 'src/infra/services/redis/redis.service';
import { MailService } from '../../mail.service';
import { PaymentEmailData } from '../../types/payment/payment-email.types';

@Injectable()
export class PaymentRejectedEmailHandler {
  private readonly logger = new Logger(PaymentRejectedEmailHandler.name);
  private readonly EMAIL_COOLDOWN_KEY = 'payment_rejected_email_cooldown';
  private readonly COOLDOWN_DURATION = 10 * 60; // 10 minutos em segundos

  constructor(
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  /**
   * Envia e-mail de pagamento reprovado
   */
  async sendPaymentRejectedEmail(paymentData: PaymentEmailData): Promise<void> {
    try {
      // Verificar se já enviou email recentemente para esta inscrição
      const cooldownKey = `${this.EMAIL_COOLDOWN_KEY}:${paymentData.inscriptionId}`;
      const hasRecentEmail = await this.redisService.get(cooldownKey);

      if (hasRecentEmail) {
        this.logger.log(
          `E-mail de pagamento reprovado já foi enviado recentemente para inscrição ${paymentData.inscriptionId}. Pulando envio.`,
        );
        return;
      }

      // Verificar se tem email para enviar
      if (!paymentData.responsibleEmail) {
        this.logger.warn(
          `Inscrição ${paymentData.inscriptionId} não possui e-mail cadastrado. Nenhum e-mail será enviado.`,
        );
        return;
      }

      // Enriquecer dados faltantes (inscrição e evento)
      if (
        !paymentData.responsibleEmail ||
        !paymentData.responsibleName ||
        !paymentData.responsiblePhone
      ) {
        const inscription = await this.inscriptionGateway.findById(
          paymentData.inscriptionId,
        );
        if (inscription) {
          paymentData.responsibleName =
            paymentData.responsibleName || inscription.getResponsible();
          paymentData.responsibleEmail =
            paymentData.responsibleEmail || inscription.getEmail();
          paymentData.responsiblePhone =
            paymentData.responsiblePhone || inscription.getPhone();
        }
      }

      if (!paymentData.eventName && paymentData.eventId) {
        const event = await this.eventGateway.findById(paymentData.eventId);
        if (event) {
          paymentData.eventName = event.getName();
        }
      }

      // Enviar e-mail via template (MJML + Handlebars)
      const loginUrl =
        process.env.FRONTEND_LOGIN_URL && process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_LOGIN_URL
          : 'http://localhost:3333/login';

      await this.mailService.sendTemplateMail({
        to: paymentData.responsibleEmail as string,
        subject: `Pagamento Reprovado - ${paymentData.eventName ?? ''}`,
        templateName: 'payment/payment-rejected',
        context: { paymentData, loginUrl, year: new Date().getFullYear() },
      });

      // Definir cooldown no Redis
      await this.redisService.setex(
        cooldownKey,
        this.COOLDOWN_DURATION,
        'sent',
      );

      this.logger.log(
        `E-mail de pagamento reprovado enviado para ${paymentData.responsibleName ?? ''} (${paymentData.responsibleEmail ?? ''})`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail de pagamento reprovado: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Renderização via template MJML (retirado o HTML inline)
}
