import { Controller, Get, Param } from '@nestjs/common';
import {
  GenerateTicketPdfSecondCopyInput,
  GenerateTicketPdfSecondCopyUsecase,
} from 'src/usecases/web/tickets/generate-ticket-pdf-second-copy/generate-ticket-pdf-second-copy.usecase';
import type {
  GenerateTicketPdfSecondCopyRequest,
  GenerateTicketPdfSecondCopyResponse,
} from './generate-second-copy.dto';
import { GenerateTicketPdfSecondCopyPresenter } from './generate-second-copy.presenter';

@Controller('tickets')
export class GenerateTicketPdfSecondCopyRoute {
  public constructor(
    private readonly generateTicketPdfSecondCopyUsecase: GenerateTicketPdfSecondCopyUsecase,
  ) {}

  @Get(':ticketSaleId/pdf/second-copy')
  public async handle(
    @Param() params: GenerateTicketPdfSecondCopyRequest,
  ): Promise<GenerateTicketPdfSecondCopyResponse> {
    const input: GenerateTicketPdfSecondCopyInput = {
      ticketSaleId: params.ticketSaleId,
    };

    const result = await this.generateTicketPdfSecondCopyUsecase.execute(input);
    return GenerateTicketPdfSecondCopyPresenter.toHttp(result);
  }
}
