import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import { createElement, type ComponentType } from 'react';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!smtpUser || !clientId || !clientSecret || !refreshToken) {
      this.logger.warn(
        'Credenciais OAuth2 não configuradas. Variáveis SMTP_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN devem estar definidas.',
      );
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: smtpUser,
        clientId,
        clientSecret,
        refreshToken,
      },
    });
  }

  async sendMail({
    to,
    subject,
    html,
    attachments,
  }: {
    to: string;
    subject: string;
    html: string;
    attachments?: nodemailer.SendMailOptions['attachments'];
  }) {
    try {
      if (
        !process.env.SMTP_USER ||
        !process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REFRESH_TOKEN
      ) {
        const errorMessage =
          'Credenciais OAuth2 não configuradas. Configure as variáveis no Railway.';
        this.logger.error(errorMessage);
        throw new Error(errorMessage);
      }

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
        attachments,
      });

      this.logger.log(`E-mail enviado com sucesso: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendTemplateMail({
    to,
    subject,
    templateName,
    context,
    attachments,
  }: {
    to: string;
    subject: string;
    templateName: string;
    context: Record<string, unknown>;
    attachments?: nodemailer.SendMailOptions['attachments'];
  }) {
    try {
      const html = await this.renderReactTemplate(templateName, context);
      return await this.sendMail({ to, subject, html, attachments });
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
    'payment/payment-review-notification': () =>
      import('./templates/payment/payment-review-notification/index.js'),
    'payment/payment-receipt-update': () =>
      import('./templates/payment/payment-receipt-update/index.js'),
    'inscription/inscription-notification': () =>
      import('./templates/inscription/inscription-notification/index.js'),
    'inscription/status-approved': () =>
      import('./templates/inscription/status-approved/index.js'),
    'inscription/status-rejected': () =>
      import('./templates/inscription/status-rejected/index.js'),
    'inscription/guest-registration': () =>
      import('./templates/inscription/guest-registration/index.js'),
    'inscription/guest-expired': async () =>
      // @ts-ignore
      require('./templates/inscription/guest-expired/index'),
    'inscription/guest-expired-cleanup': () =>
      import('./templates/inscription/guest-expired-cleanup/index.js'),
    'tickets/pre-sale-approved': () =>
      import('./templates/tickets/pre-sale-approved/index.js'),
    'tickets/pre-sale-notification': () =>
      import('./templates/tickets/pre-sale-notification/index.js'),
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

    const element = createElement(TemplateComponent, context);

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
      return (exportedDefault as Record<string, unknown>)[
        'default'
      ] as ComponentType<Record<string, unknown>>;
    }

    const namedExportEntry = Object.entries(module).find(
      ([key, value]) =>
        key !== 'default' &&
        key !== '__esModule' &&
        typeof value === 'function',
    );

    return (
      (namedExportEntry?.[1] as ComponentType<Record<string, unknown>>) ?? null
    );
  }
}
