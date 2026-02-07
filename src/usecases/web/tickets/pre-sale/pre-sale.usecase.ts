import { Injectable, Logger } from '@nestjs/common';
import { PaymentMethod, TicketSaleStatus } from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { TicketSaleNotificationEmailHandler } from 'src/infra/services/mail/handlers/tickets/ticket-sale-notification-email.handler';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';
import { TicketNotFoundUsecaseException } from '../../exceptions/tickets/ticket-not-found.usecase.exception';

export type PreSaleInput = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  totalValue: number;
  image: string;
  tickets: Tickets[];
};

type Tickets = {
  ticketId: string;
  quantity: number;
};

export type PreSaleOutput = {
  id: string;
  status: TicketSaleStatus;
};

@Injectable()
export class PreSaleUseCase implements Usecase<PreSaleInput, PreSaleOutput> {
  private readonly logger = new Logger(PreSaleUseCase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventTicketsGateway: EventTicketsGateway,
    private readonly ticketSaleGateway: TicketSaleGateway,
    private readonly ticketSalePaymentGateway: TicketSalePaymentGateway,
    private readonly ticketSaleItemGateway: TicketSaleItemGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly ticketSaleNotificationEmailHandler: TicketSaleNotificationEmailHandler,
    private readonly userGateway: AccountGateway,
  ) {}

  public async execute(input: PreSaleInput): Promise<PreSaleOutput> {
    const { eventId, tickets: inputTickets } = input;

    // Find event
    const event = await this.eventGateway.findById(eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${eventId} not found.`,
        `Evento não encontrado.`,
        PreSaleUseCase.name,
      );
    }

    // Find tickets
    const ticketIds = inputTickets.map((t) => t.ticketId);
    const tickets = await this.eventTicketsGateway.findByIds(ticketIds);

    if (tickets.length !== ticketIds.length) {
      throw new TicketNotFoundUsecaseException(
        `Some tickets with ids ${ticketIds.join(', ')} not found.`,
        `Alguns tickets informados não foram encontrados.`,
        PreSaleUseCase.name,
      );
    }

    const ticketMap = new Map(tickets.map((t) => [t.getId(), t]));

    // Validate stock
    for (const { ticketId, quantity } of inputTickets) {
      const ticket = ticketMap.get(ticketId);

      if (!ticket) {
        throw new TicketNotFoundUsecaseException(
          `Ticket ${ticketId} not found.`,
          `Ticket informado não encontrado.`,
          PreSaleUseCase.name,
        );
      }

      if (ticket.getAvailable() < quantity) {
        throw new TicketNotFoundUsecaseException(
          `Ticket ${ticket.getId()} has only ${ticket.getAvailable()} available.`,
          `O ticket ${ticket.getName()} possui apenas ${ticket.getAvailable()} disponíveis.`,
          PreSaleUseCase.name,
        );
      }
    }

    // Create sale
    const sale = TicketSale.create({
      eventId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      status: TicketSaleStatus.UNDER_REVIEW,
      totalValue: input.totalValue,
    });

    await this.ticketSaleGateway.create(sale);

    // Process image (after all validations)
    const paymentImageUrl = await this.processEventImage(
      input.image,
      eventId,
      sale.getId(),
      sale.getTotalValue(),
    );

    // Create payment
    const payment = TicketSalePayment.create({
      ticketSaleId: sale.getId(),
      paymentMethod: PaymentMethod.PIX,
      value: sale.getTotalValue(),
      imageUrl: paymentImageUrl,
    });

    await this.ticketSalePaymentGateway.create(payment);

    // Create sale items
    for (const { ticketId, quantity } of inputTickets) {
      const ticket = ticketMap.get(ticketId)!;

      const saleItem = TicketSaleItem.create({
        ticketSaleId: sale.getId(),
        ticketId: ticketId,
        quantity,
        pricePerTicket: ticket.getPrice(),
        totalValue: ticket.getPrice() * quantity,
      });

      await this.ticketSaleItemGateway.create(saleItem);
    }

    // Update stock
    for (const { ticketId, quantity } of inputTickets) {
      await this.eventTicketsGateway.decrementAvailable(ticketId, quantity);
    }

    await this.notifyEventResponsibles(event, sale, payment);

    return {
      id: sale.getId(),
      status: sale.getStatus(),
    };
  }

  private async processEventImage(
    image: string,
    eventId: string,
    ticketSaleId: string,
    value: number,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    // Validate image
    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      `pre-sale-ticket-${value}.${extension}`,
    );
    if (!isValidImage) {
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        PreSaleUseCase.name,
      );
    }

    // Optimize image
    const optimizedImage = await this.imageOptimizerService.optimizeImage(
      buffer,
      {
        maxWidth: 800,
        maxHeight: 800,
        quality: 70,
        format: 'webp',
        maxFileSize: 300 * 1024,
      },
    );

    const eventName = await this.eventGateway.findById(eventId);

    // Sanitize event name to avoid invalid characters in Supabase
    const sanitizedEventName = sanitizeFileName(
      eventName?.getName() || 'evento',
    );

    // Create file name: pre-sale-ticket+value+formatted datetime
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `pre-sale-ticket_${ticketSaleId}_${value}_${formattedDateTime}.${optimizedImage.format}`;

    // Upload image to Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: `tickets/${sanitizedEventName}`,
      fileName: fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }

  private async notifyEventResponsibles(
    event: Event,
    sale: TicketSale,
    payment: TicketSalePayment,
  ): Promise<void> {
    try {
      const responsibles = await this.eventResponsibleGateway.findByEventId(
        event.getId(),
      );

      if (!responsibles.length) {
        console.warn(
          `Evento ${event.getId()} não possui responsáveis cadastrados para notificação de pré-venda`,
        );
        return;
      }

      const responsibleUsers = await Promise.all(
        responsibles.map(async (responsible) => {
          const user = await this.userGateway.findById(
            responsible.getAccountId(),
          );
          return {
            id: responsible.getAccountId(),
            username: user?.getUsername() || 'Usuário não encontrado',
            email: user?.getEmail(),
          };
        }),
      );

      const responsiblesWithEmail = responsibleUsers.filter((responsible) =>
        Boolean(responsible.email),
      );

      if (!responsiblesWithEmail.length) {
        console.warn(
          `Evento ${event.getId()} não possui responsáveis com e-mail cadastrado`,
        );
        return;
      }

      await this.ticketSaleNotificationEmailHandler.sendTicketSaleNotification(
        {
          saleId: sale.getId(),
          paymentId: payment.getId(),
          eventName: event.getName(),
          eventLocation: event.getLocation(),
          eventStartDate: event.getStartDate(),
          eventEndDate: event.getEndDate(),
          buyerName: sale.getName(),
          buyerEmail: sale.getEmail(),
          buyerPhone: sale.getPhone(),
          totalValue: Number(sale.getTotalValue()),
          paymentMethod: payment.getPaymentMethod(),
          paymentValue: payment.getValue(),
          submittedAt: sale.getCreatedAt(),
        },
        responsiblesWithEmail,
      );
    } catch (error) {
      console.error(
        'Erro ao enviar e-mail de notificação de venda de tickets:',
        error,
      );
    }
  }
}
