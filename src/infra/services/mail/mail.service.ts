import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import { createElement, type ComponentType } from 'react';

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
        from: `"Sistema Inscrição" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
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

  /**
   * Envia e-mail a partir de um template React
   * templateName: caminho relativo a src/infra/services/mail/templates (ex: 'payment/payment-approved')
   */
  async sendTemplateMail({
    to,
    subject,
    templateName,
    context,
  }: {
    to: string;
    subject: string;
    templateName: string;
    context: Record<string, unknown>;
  }) {
    try {
      const html = await this.renderReactTemplate(templateName, context);
      return await this.sendMail({ to, subject, html });
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail por template '${templateName}': ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private templateLoaders: Record<string, () => Promise<{ default: any }>> = {
    'payment/payment-approved': () =>
      import('./templates/payment/payment-approved/index.js'),
    'payment/payment-rejected': () =>
      import('./templates/payment/payment-rejected/index.js'),
    'inscription/inscription-notification': () =>
      import('./templates/inscription/inscription-notification/index.js'),
  };

  private async renderReactTemplate(
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<string> {
    const loader = this.templateLoaders[templateName];

    if (!loader) {
      throw new Error(
        `Template React não encontrado para "${templateName}". Verifique o mapeamento em MailService.`,
      );
    }

    const module = await loader();
    const TemplateComponent = this.resolveTemplateComponent(module);

    if (!TemplateComponent) {
      throw new Error(
        `Template React "${templateName}" não exporta um componente default.`,
      );
    }

    const element = createElement(
      TemplateComponent,
      context as Record<string, unknown>,
    );

    return await render(element);
  }

  private resolveTemplateComponent(
    module: Record<string, unknown>,
  ): ComponentType<Record<string, unknown>> | null {
    const exportedDefault = module['default'];

    if (typeof exportedDefault === 'function') {
      return exportedDefault as ComponentType<Record<string, unknown>>;
    }

    if (
      exportedDefault &&
      typeof exportedDefault === 'object' &&
      typeof (exportedDefault as Record<string, unknown>)['default'] ===
        'function'
    ) {
      return (exportedDefault as Record<string, unknown>)['default'] as ComponentType<
        Record<string, unknown>
      >;
    }

    const namedExportEntry = Object.entries(module).find(
      ([key, value]) =>
        key !== 'default' &&
        key !== '__esModule' &&
        typeof value === 'function',
    );

    return (namedExportEntry?.[1] as ComponentType<Record<string, unknown>>) ??
      null;
  }
}
