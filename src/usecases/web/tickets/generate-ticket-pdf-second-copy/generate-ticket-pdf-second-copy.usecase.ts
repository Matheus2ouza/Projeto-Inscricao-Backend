import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Buffer } from 'node:buffer';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { TicketUnitGateway } from 'src/domain/repositories/ticket-unit.gatewat';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  TicketUnitCard,
  TicketUnitsPdfData,
  TicketUnitsPdfGenerator,
} from 'src/shared/utils/pdfs/tickets/ticket-units-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { TicketSaleNotFoundUsecaseException } from 'src/usecases/web/exceptions/tickets/ticket-sale-not-found.usecase.exception';
import { TicketUnitsNotFoundUsecaseException } from 'src/usecases/web/exceptions/tickets/ticket-units-not-found.usecase.exception';

export type GenerateTicketPdfSecondCopyInput = {
  ticketSaleId: string;
};

export type GenerateTicketPdfSecondCopyOutput = {
  filename: string;
  pdfBase64: string;
};

@Injectable()
export class GenerateTicketPdfSecondCopyUsecase
  implements
    Usecase<GenerateTicketPdfSecondCopyInput, GenerateTicketPdfSecondCopyOutput>
{
  public constructor(
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly ticketUnitGateway: TicketUnitGateway,
    private readonly eventTicketGateway: EventTicketsGateway,
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GenerateTicketPdfSecondCopyInput,
  ): Promise<GenerateTicketPdfSecondCopyOutput> {
    const ticketSale = await this.ticketSaleGateway.findById(
      input.ticketSaleId,
    );

    if (!ticketSale) {
      throw new TicketSaleNotFoundUsecaseException(
        `TicketSale with id ${input.ticketSaleId} not found`,
        'Venda não encontrada.',
        GenerateTicketPdfSecondCopyUsecase.name,
      );
    }

    const eventDetails = await this.eventGateway.findById(
      ticketSale.getEventId(),
    );

    if (!eventDetails) {
      throw new EventNotFoundUsecaseException(
        `Event ${ticketSale.getEventId()} not found while generating pdf second copy`,
        'Evento não encontrado.',
        GenerateTicketPdfSecondCopyUsecase.name,
      );
    }

    const saleItems = await this.ticketSaleItemGateway.findByTicketSaleId(
      ticketSale.getId(),
    );

    if (!saleItems.length) {
      throw new TicketUnitsNotFoundUsecaseException(
        `TicketSale ${ticketSale.getId()} does not have items to generate pdf`,
        'Nenhum item encontrado para esta venda.',
        GenerateTicketPdfSecondCopyUsecase.name,
      );
    }

    const ticketSaleItemIds = saleItems.map((item) => item.getId());
    const ticketUnits =
      await this.ticketUnitGateway.findByTicketSaleItemIds(ticketSaleItemIds);

    if (!ticketUnits.length) {
      throw new TicketUnitsNotFoundUsecaseException(
        `TicketSale ${ticketSale.getId()} does not have ticket units generated`,
        'Os tickets desta venda ainda não foram liberados.',
        GenerateTicketPdfSecondCopyUsecase.name,
      );
    }

    const saleItemMap = new Map(saleItems.map((item) => [item.getId(), item]));
    const ticketIds = [...new Set(saleItems.map((item) => item.getTicketId()))];

    const eventTickets = ticketIds.length
      ? await this.eventTicketGateway.findByIds(ticketIds)
      : [];

    const ticketNameMap = new Map(
      eventTickets.map((ticket) => [ticket.getId(), ticket.getName()]),
    );

    const counters = new Map<string, number>();
    const ticketCards: TicketUnitCard[] = ticketUnits.map((unit) => {
      const saleItem = saleItemMap.get(unit.getTicketSaleItemId());
      const ticketName = saleItem
        ? (ticketNameMap.get(saleItem.getTicketId()) ?? 'Ticket')
        : 'Ticket';

      const next = (counters.get(ticketName) ?? 0) + 1;
      counters.set(ticketName, next);

      return {
        ticketUnitId: unit.getId(),
        ticketName,
        qrCode: unit.getQrCode(),
      };
    });

    const eventLogoDataUrl = await this.resolveEventLogoDataUrl(
      eventDetails.getLogoUrl(),
    );

    const pdfData: TicketUnitsPdfData = {
      header: {
        title: eventDetails.getName() ?? 'Evento',
        image: eventLogoDataUrl,
      },
      saleInfo: {
        saleId: ticketSale.getId(),
        buyerName: ticketSale.getName(),
        buyerEmail: ticketSale?.getEmail() ?? '',
        buyerPhone: ticketSale?.getPhone() ?? '',
        totalTickets: ticketUnits.length,
        totalValue: Number(ticketSale.getTotalValue()),
      },
      tickets: ticketCards,
    };

    const pdfBuffer =
      await TicketUnitsPdfGenerator.generateTicketUnitsPdf(pdfData);

    return {
      filename: this.buildFilename(eventDetails.getName(), ticketSale.getId()),
      pdfBase64: pdfBuffer.toString('base64'),
    };
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
      return undefined;
    }
  }

  private buildFilename(eventName: string | undefined, saleId: string): string {
    const sanitizedEventName = eventName
      ? eventName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()
      : 'evento';

    return `tickets-${sanitizedEventName}-${saleId}.pdf`;
  }
}
