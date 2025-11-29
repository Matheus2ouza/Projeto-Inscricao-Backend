import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { TicketSaleStatus } from 'generated/prisma';
import { Buffer } from 'node:buffer';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { MailService } from 'src/infra/services/mail/mail.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  TicketUnitCard,
  TicketUnitsPdfData,
  TicketUnitsPdfGenerator,
} from 'src/shared/utils/pdfs/tickets/ticket-units-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { TicketSaleNotFoundUsecaseException } from '../../exceptions/tickets/ticket-sale-not-found.usecase.exception';

export type ApprovePreSaleInput = {
  accountId: string;
  ticketSaleId: string;
};

export type ApprovePreSaleOutput = {
  ticketSaleId: string;
  status: TicketSaleStatus;
};

@Injectable()
export class ApprovePreSaleUseCase
  implements Usecase<ApprovePreSaleInput, ApprovePreSaleOutput>
{
  private readonly logger = new Logger(ApprovePreSaleUseCase.name);

  constructor(
    private ticketSaleGateway: TicketSaleGateway,
    private eventTicketGateway: EventTicketsGateway,
    private eventGateway: EventGateway,
    private mailService: MailService,
    private supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: ApprovePreSaleInput,
  ): Promise<ApprovePreSaleOutput> {
    this.logger.log(
      `Iniciando aprovação da pré-venda ${input.ticketSaleId} pelo usuário ${input.accountId}`,
    );

    // Buscar venda
    const ticketSale = await this.ticketSaleGateway.findById(
      input.ticketSaleId,
    );

    if (!ticketSale) {
      throw new TicketSaleNotFoundUsecaseException(
        `TicketSale with id ${input.ticketSaleId} not found.`,
        `Venda de Ticket não encontrada.`,
        ApprovePreSaleUseCase.name,
      );
    }

    // Buscar dados do evento
    const eventDetails = await this.eventGateway.findById(
      ticketSale.getEventId(),
    );

    const eventName = eventDetails?.getName() ?? 'Evento';
    const eventLogoDataUrl = await this.resolveEventLogoDataUrl(
      eventDetails?.getLogoUrl(),
    );

    // Executar operação atômica no banco
    const atomicResult = await this.ticketSaleGateway.approvePreSaleAtomic(
      ticketSale.getId(),
      input.accountId,
      Number(ticketSale.getTotalValue()),
    );

    const { sale, items, ticketUnits } = atomicResult;

    // Disparar processamento do PDF + email em background
    void this.processPdfAndEmail({
      ticketSale,
      sale,
      items,
      ticketUnits,
      eventName,
      eventLogoDataUrl,
    });

    return {
      ticketSaleId: sale.id,
      status: sale.status,
    };
  }

  // Processamento do PDF + email em background
  private async processPdfAndEmail({
    ticketSale,
    sale,
    items,
    ticketUnits,
    eventName,
    eventLogoDataUrl,
  }: {
    ticketSale: any;
    sale: any;
    items: any[];
    ticketUnits: any[];
    eventName: string;
    eventLogoDataUrl?: string;
  }) {
    try {
      this.logger.log(`(BG) Processando PDF + email da venda ${sale.id}...`);

      // Mapear itens → nomes dos tickets
      const saleItemMap = new Map(items.map((i) => [i.id, i]));
      const ticketIds = [...new Set(items.map((i) => i.ticketId))];

      const eventTickets = await this.eventTicketGateway.findByIds(ticketIds);
      const ticketNameMap = new Map(
        eventTickets.map((t) => [t.getId(), t.getName()]),
      );

      const counters = new Map<string, number>();

      const ticketCards: TicketUnitCard[] = ticketUnits.map((unit) => {
        const saleItem = saleItemMap.get(unit.ticketSaleItemId);

        const ticketName = saleItem
          ? (ticketNameMap.get(saleItem.ticketId) ?? 'Ticket')
          : 'Ticket';

        const next = (counters.get(ticketName) ?? 0) + 1;
        counters.set(ticketName, next);

        return {
          order: next,
          ticketUnitId: unit.id,
          ticketName,
          qrCode: unit.qrCode,
        };
      });

      // Criar estrutura do PDF
      const pdfData: TicketUnitsPdfData = {
        header: {
          title: eventName,
          image: eventLogoDataUrl,
        },
        saleInfo: {
          saleId: sale.id,
          buyerName: ticketSale.getName(),
          buyerEmail: ticketSale.getEmail(),
          buyerPhone: ticketSale.getPhone(),
          totalTickets: ticketUnits.length,
          totalValue: Number(ticketSale.getTotalValue()),
        },
        tickets: ticketCards,
      };

      // Gerar PDF
      this.logger.log(`(BG) Gerando PDF...`);
      const pdfBuffer =
        await TicketUnitsPdfGenerator.generateTicketUnitsPdf(pdfData);

      // Enviar email
      this.logger.log(`(BG) Enviando email para ${ticketSale.getEmail()}...`);

      await this.mailService.sendTemplateMail({
        to: ticketSale.getEmail(),
        subject: `Tickets liberados - ${eventName}`,
        templateName: 'tickets/pre-sale-approved',
        context: {
          ticketData: {
            buyerName: ticketSale.getName(),
            eventName,
            totalTickets: ticketUnits.length,
            saleId: sale.id,
          },
        },
        attachments: [
          {
            filename: `tickets-${sale.id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`(BG) PDF enviado com sucesso!`);
    } catch (err) {
      this.logger.error(
        `(BG) Erro ao processar PDF/email da venda ${sale.id}: ${err.message}`,
      );
    }
  }

  private async resolveEventLogoDataUrl(
    logoPath?: string | null,
  ): Promise<string | undefined> {
    if (!logoPath) return undefined;

    try {
      const publicUrl =
        await this.supabaseStorageService.getPublicUrl(logoPath);

      const response = await axios.get<ArrayBuffer>(publicUrl, {
        responseType: 'arraybuffer',
      });

      const mimeType = response.headers['content-type'] ?? 'image/png';
      const base64 = Buffer.from(response.data).toString('base64');

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      this.logger.warn(
        `Falha ao carregar logo (${logoPath}): ${error.message}`,
      );
      return undefined;
    }
  }
}
