import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      this.logger.debug(`Enviando e-mail...`);
      this.logger.debug(
        `From: ${process.env.SENDER_EMAIL || process.env.SMTP_USER}`,
      );
      this.logger.debug(`To: ${to}`);
      this.logger.debug(`Subject: ${subject}`);

      const info = await this.transporter.sendMail({
        from: process.env.SENDER_EMAIL || process.env.SMTP_USER,
        to,
        subject,
        html,
      });

      this.logger.log(`E-mail enviado com sucesso: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`, error.stack);
      throw error;
    }
  }
}
