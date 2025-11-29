import { Injectable } from '@nestjs/common';
import { TicketSaleStatus } from 'generated/prisma';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { Usecase } from 'src/usecases/usecase';
import { TicketSaleNotFoundUsecaseException } from '../../exceptions/tickets/ticket-sale-not-found.usecase.exception';

export type RejectPreSaleInput = {
  ticketSaleId: string;
};

export type RejectPreSaleOutput = {
  ticketSaleId: string;
  status: TicketSaleStatus;
};

@Injectable()
export class RejectPreSaleUseCase
  implements Usecase<RejectPreSaleInput, RejectPreSaleOutput>
{
  constructor(private ticketSaleGateway: TicketSaleGateway) {}

  public async execute(
    input: RejectPreSaleInput,
  ): Promise<RejectPreSaleOutput> {
    const ticketSale = await this.ticketSaleGateway.findById(
      input.ticketSaleId,
    );
    if (!ticketSale) {
      throw new TicketSaleNotFoundUsecaseException(
        `TicketSale with id ${input.ticketSaleId} not found.`,
        `Venda de Ticket não encontrada.`,
        RejectPreSaleUseCase.name,
      );
    }

    ticketSale.reject();

    await this.ticketSaleGateway.rejectPreSale(
      ticketSale.getId(),
      ticketSale.getStatus(),
      ticketSale.getUpdateAt(),
    );

    const output: RejectPreSaleOutput = {
      ticketSaleId: ticketSale.getId(),
      status: ticketSale.getStatus(),
    };
    return output;
  }
}
