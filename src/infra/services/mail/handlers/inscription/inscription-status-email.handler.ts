import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mail.service';
import type { InscriptionStatusEmailData } from '../../types/inscription/inscription-status-email.types';
import { RedisService } from '../../../redis/redis.service';

@Injectable()
export class InscriptionStatusEmailHandler {
  private readonly logger = new Logger(InscriptionStatusEmailHandler.name);
  private readonly EMAIL_COOLDOWN_KEY =
    'inscription_status_email_cooldown';
  private readonly COOLDOWN_DURATION = 10 * 60; // 10 minutos em segundos

  public constructor(
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
  ) {}

  public async sendApprovedEmail(
    statusData: InscriptionStatusEmailData,
  ): Promise<void> {
    await this.sendEmail({
      statusData,
      subject: `Inscrição aprovada - ${statusData.eventName}`,
      template: 'inscription/status-approved',
    });
  }

  public async sendRejectedEmail(
    statusData: InscriptionStatusEmailData,
  ): Promise<void> {
    await this.sendEmail({
      statusData,
      subject: `Inscrição reprovada - ${statusData.eventName}`,
      template: 'inscription/status-rejected',
    });
  }

  private async sendEmail({
    statusData,
    subject,
    template,
  }: {
    statusData: InscriptionStatusEmailData;
    subject: string;
    template: string;
  }): Promise<void> {
    try {
      const cooldownKey = `${this.EMAIL_COOLDOWN_KEY}:${statusData.inscriptionId}:${template}`;
      const hasRecentEmail = await this.redisService.get(cooldownKey);

      if (hasRecentEmail) {
        this.logger.log(
          `E-mail '${template}' já enviado recentemente para inscrição ${statusData.inscriptionId}. Pulando envio.`,
        );
        return;
      }

      await this.mailService.sendTemplateMail({
        to: statusData.responsibleEmail,
        subject,
        templateName: template,
        context: {
          statusData,
          year: new Date().getFullYear(),
        },
      });

      await this.redisService.setex(
        cooldownKey,
        this.COOLDOWN_DURATION,
        'sent',
      );

      this.logger.log(
        `E-mail '${template}' enviado para ${statusData.responsibleEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail '${template}' para ${statusData.responsibleEmail}: ${error.message}`,
        error.stack,
      );
    }
  }
}
