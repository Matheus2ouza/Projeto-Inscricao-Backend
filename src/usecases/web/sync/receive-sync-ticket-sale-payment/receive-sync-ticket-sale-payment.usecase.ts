import { Logger } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncTicketSalePaymentInput = {
  eventTicket: EventTicket;
};

export type ReceiveSyncTicketSalePaymentOutput = {
  id: string;
  operation: 'created' | 'updated';
};

export class ReceiveSyncTicketSalePaymentUsecase
  implements
    Usecase<
      ReceiveSyncTicketSalePaymentInput,
      ReceiveSyncTicketSalePaymentOutput
    >
{
  private readonly logger = new Logger(
    ReceiveSyncTicketSalePaymentUsecase.name,
  );
  constructor(private readonly eventTicketsGateway: EventTicketsGateway) {}

  async execute(
    input: ReceiveSyncTicketSalePaymentInput,
  ): Promise<ReceiveSyncTicketSalePaymentOutput> {
    const eventTicket = input.eventTicket;

    this.logger.log('Validando se o ticket já existe no banco');
    const existingTicketSale = await this.eventTicketsGateway.findById(
      eventTicket.getId(),
    );

    this.logger.log(
      `Ticket ${eventTicket.getId()} ${existingTicketSale ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    await this.eventTicketsGateway.upsert(eventTicket);

    this.logger.log(`Inscrição sincronizada: ${eventTicket.getId()}`);
    const output: ReceiveSyncTicketSalePaymentOutput = {
      id: eventTicket.getId(),
      operation: existingTicketSale ? 'updated' : 'created',
    };

    return output;
  }
}
