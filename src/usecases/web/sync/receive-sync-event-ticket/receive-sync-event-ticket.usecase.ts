import { Logger } from '@nestjs/common';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import { EventTicketsGateway } from 'src/domain/repositories/event-tickets.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncEventTicketInput = {
  eventTicket: EventTicket;
};

export type ReceiveSyncEventTicketOutput = {
  id: string;
  operation: 'created' | 'updated';
};

export class ReceiveSyncEventTicketUsecase
  implements Usecase<ReceiveSyncEventTicketInput, ReceiveSyncEventTicketOutput>
{
  private readonly logger = new Logger(ReceiveSyncEventTicketUsecase.name);
  constructor(private readonly eventTicketsGateway: EventTicketsGateway) {}

  async execute(
    input: ReceiveSyncEventTicketInput,
  ): Promise<ReceiveSyncEventTicketOutput> {
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
    const output: ReceiveSyncEventTicketOutput = {
      id: eventTicket.getId(),
      operation: existingTicketSale ? 'updated' : 'created',
    };

    return output;
  }
}
