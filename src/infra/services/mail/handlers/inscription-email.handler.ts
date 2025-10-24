import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail.service';
import {
  EventResponsibleEmailData,
  InscriptionEmailData,
  InscriptionEmailTemplateData,
} from '../types/inscription-email.types';

@Injectable()
export class InscriptionEmailHandler {
  private readonly logger = new Logger(InscriptionEmailHandler.name);
  // Usando apenas template inline - não precisa de arquivo externo

  constructor(private readonly mailService: MailService) {}

  /**
   * Envia e-mail de notificação de inscrição para os responsáveis do evento
   */
  async sendInscriptionNotification(
    inscriptionData: InscriptionEmailData,
    responsibles: EventResponsibleEmailData[],
  ): Promise<void> {
    try {
      if (responsibles.length === 0) {
        this.logger.warn(
          `Evento "${inscriptionData.eventName}" não possui responsáveis cadastrados. Nenhum e-mail será enviado.`,
        );
        return;
      }

      // Preparar dados para o template
      const templateData: InscriptionEmailTemplateData = {
        eventData: {
          ...inscriptionData,
        },
        responsibles,
      };

      // Renderizar template HTML
      const htmlContent = await this.renderTemplate(templateData);

      // Enviar e-mail para cada responsável
      const emailPromises = responsibles.map(async (responsible) => {
        if (responsible.email) {
          await this.mailService.sendMail({
            to: responsible.email,
            subject: `Nova Inscrição - ${inscriptionData.eventName}`,
            html: htmlContent,
          });

          this.logger.log(
            `E-mail de inscrição enviado para ${responsible.username} (${responsible.email})`,
          );
        } else {
          this.logger.warn(
            `Responsável ${responsible.username} não possui e-mail cadastrado`,
          );
        }
      });

      await Promise.all(emailPromises);

      this.logger.log(
        `E-mails de inscrição enviados para ${responsibles.length} responsável(is) do evento "${inscriptionData.eventName}"`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao enviar e-mail de inscrição: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Renderiza o template HTML com os dados fornecidos
   */
  private async renderTemplate(
    data: InscriptionEmailTemplateData,
  ): Promise<string> {
    try {
      // Usar apenas template inline
      const template = this.getInlineTemplate();

      // Substituir placeholders simples
      let html = template
        .replace(/\{\{eventData\.eventName\}\}/g, data.eventData.eventName)
        .replace(
          /\{\{eventData\.responsibleName\}\}/g,
          data.eventData.responsibleName,
        )
        .replace(
          /\{\{eventData\.responsiblePhone\}\}/g,
          data.eventData.responsiblePhone,
        )
        .replace(
          /\{\{eventData\.totalValue\}\}/g,
          this.formatCurrency(data.eventData.totalValue),
        )
        .replace(
          /\{\{eventData\.participantCount\}\}/g,
          data.eventData.participantCount.toString(),
        )
        .replace(
          /\{\{eventData\.accountUsername\}\}/g,
          data.eventData.accountUsername,
        )
        .replace(
          /\{\{eventData\.inscriptionDate\}\}/g,
          this.formatDate(data.eventData.inscriptionDate),
        )
        .replace(/\{\{currentDate\}\}/g, this.formatDate(new Date()));

      const responsibleEmailSection = data.eventData.responsibleEmail
        ? `<div class="info-item">
            <div class="info-label">E-mail</div>
            <div class="info-value">${data.eventData.responsibleEmail}</div>
          </div>`
        : '';
      html = html.replace(
        '{{responsibleEmailSection}}',
        responsibleEmailSection,
      );

      html = html.replace(
        '{{inscriptionTime}}',
        this.formatTime(data.eventData.inscriptionDate),
      );

      return html;
    } catch (error) {
      this.logger.error(`Erro ao renderizar template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Formata valor monetário para exibição
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formata data para exibição
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  /**
   * Formata hora para exibição
   */
  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  /**
   * Template HTML inline completo
   */
  private getInlineTemplate(): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Inscrição - {{eventData.eventName}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2533;
            max-width: 640px;
            margin: 0 auto;
            padding: 32px 16px;
            background-color: #eef1f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 14px;
            border: 1px solid #d6deef;
            box-shadow: 0 18px 45px rgba(36, 54, 94, 0.15);
            overflow: hidden;
        }
        .header {
            padding: 36px 32px;
            background: linear-gradient(135deg, #4556d4 0%, #7f53c6 100%);
            color: #ffffff;
            text-align: left;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.4px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 15px;
            opacity: 0.95;
        }
        .event-name-highlight {
            margin-top: 18px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 12px 18px;
            border-radius: 10px;
            background-color: rgba(255, 255, 255, 0.18);
            font-size: 15px;
        }
        .event-name-highlight .label {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.6px;
        }
        .event-name-highlight .value {
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.3px;
        }
        .content {
            padding: 32px;
            background: linear-gradient(180deg, #fafbff 0%, #ffffff 85%);
        }
        .section {
            margin: 0;
            padding: 22px 24px;
            border-radius: 12px;
            border: 1px solid #e2e7f5;
            background-color: #ffffff;
            box-shadow: 0 8px 22px rgba(55, 81, 126, 0.08);
        }
        .section + .section {
            margin-top: 28px;
        }
        .total-section + .section {
            margin-top: 32px;
        }
        .section h2 {
            margin: 0 0 18px;
            font-size: 18px;
            color: #4556d4;
            letter-spacing: 0.3px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 24px;
        }
        .info-item {
            background-color: #ffffff;
            padding: 14px 16px;
            border-radius: 10px;
            border: 1px solid #dde3f4;
            box-shadow: 0 5px 18px rgba(73, 87, 125, 0.09);
        }
        .info-item + .info-item {
            margin-top: 16px;
        }
        .info-label {
            font-weight: 600;
            color: #5d6a91;
            font-size: 12px;
            letter-spacing: 0.4px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .info-value {
            color: #1f2533;
            font-size: 16px;
            line-height: 1.5;
            word-break: break-word;
        }
        .total-section {
            background: linear-gradient(120deg, #eff4ff 0%, #e4ebff 100%);
            padding: 28px;
            border-radius: 14px;
            margin-top: 30px;
            text-align: center;
            border: 1px solid #d2dbff;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
        .total-value {
            font-size: 30px;
            font-weight: 700;
            color: #2f4fd1;
            letter-spacing: 0.4px;
        }
        .responsibles-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .responsibles-list li {
            margin-bottom: 8px;
            color: #212529;
        }
        .footer {
            background-color: #f5f7fb;
            padding: 24px;
            text-align: center;
            color: #6f7a98;
            font-size: 14px;
            border-top: 1px solid #e4e8ef;
        }
        .no-responsibles {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .content {
                padding: 26px 20px;
            }
            .section {
                padding: 18px 18px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nova inscrição registrada</h1>
            <p>O evento recebeu um novo registro de participação. Confira as informações consolidadas.</p>
            <div class="event-name-highlight">
                <span class="value">{{eventData.eventName}}</span>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2>Dados do responsável</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Nome</div>
                        <div class="info-value">{{eventData.responsibleName}}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Telefone</div>
                        <div class="info-value">{{eventData.responsiblePhone}}</div>
                    </div>
                    {{responsibleEmailSection}}
                </div>
            </div>

            <div class="section">
                <h2>Resumo da inscrição</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Qtd de Participantes</div>
                        <div class="info-value">{{eventData.participantCount}}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Conta Responsável</div>
                        <div class="info-value">{{eventData.accountUsername}}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Data da Inscrição</div>
                        <div class="info-value">{{eventData.inscriptionDate}}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Hora da Inscrição</div>
                        <div class="info-value">{{inscriptionTime}}</div>
                    </div>
                </div>
            </div>

            <div class="total-section">
                <h3>Valor total da inscrição</h3>
                <div class="total-value">{{eventData.totalValue}}</div>
            </div>
        </div>

        <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo sistema de inscrições.</p>
            <p>Data de envio: {{currentDate}}</p>
        </div>
    </div>
</body>
</html>`;
  }
}
