import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateTicketsSaleUsecase } from 'src/usecases/web/event/update-tickets-sale/update-tickets-sale.usecase';
import type {
  UpdateTicketsSaleRequest,
  UpdateTicketsSaleResponse,
} from './update-tickets-sale.dto';
import { UpdateTicketsSalePresenter } from './update-tickets-sale.presenter';

@Controller('events')
export class UpdateTicketsSaleRoute {
  public constructor(
    private readonly updateTicketsSaleUsecase: UpdateTicketsSaleUsecase,
  ) {}

  @Patch(':id/update/tickets')
  @ApiOperation({
    summary: 'Atualiza o status de venda de tickets de um evento',
    description:
      'Permite ao administrador alterar o status de venda de tickets de um evento específico. ' +
      'O ID é passado via parâmetro e o novo status via corpo da requisição (saleTicketsEnabled: boolean).',
  })
  async handle(
    @Param('id') id: string,
    @Body() body: UpdateTicketsSaleRequest,
  ): Promise<UpdateTicketsSaleResponse> {
    const response = await this.updateTicketsSaleUsecase.execute({
      eventId: id,
      saleTicketsEnabled: body.saleTicketsEnabled,
    });

    return UpdateTicketsSalePresenter.toHttp(response);
  }
}
