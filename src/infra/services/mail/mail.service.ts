import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import { google } from 'googleapis';
import { createElement, type ComponentType } from 'react';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost',
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return oauth2Client;
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
    attachments?: any[];
  }) {
    try {
      const auth = this.getOAuth2Client();
      const gmail = google.gmail({ version: 'v1', auth });

      const from = `"Sistema Inscrição" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`;

      const messageParts = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html,
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      this.logger.log(`E-mail enviado com sucesso: ${res.data.id}`);
      return res.data;
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
    attachments?: any[];
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
