import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GeneratePdfExpensesInput,
  GeneratePdfExpensesUsecase,
} from 'src/usecases/web/expenses/reports/pdf/generate-pdf-expenses/generate-pdf-expenses.usecase';
import {
  GeneratePdfExpensesParams,
  GeneratePdfExpensesQuery,
  GeneratePdfExpensesResponse,
} from './generate-pdf-expenses.dto';
import { GeneratePdfExpensesPresenter } from './generate-pdf-expenses.presenter';

@Controller('expenses')
export class GeneratePdfExpensesRoute {
  constructor(
    private readonly generatePdfExpensesUsecase: GeneratePdfExpensesUsecase,
  ) {}

  @Get(':eventId/all/pdf')
  async handle(
    @Param() param: GeneratePdfExpensesParams,
    @Query() query: GeneratePdfExpensesQuery,
  ): Promise<GeneratePdfExpensesResponse> {
    const input: GeneratePdfExpensesInput = {
      eventId: param.eventId,
      category: query.category,
      paymentMethod: query.paymentMethod,
      startCreatedAt: query.startCreatedAt,
      endCreatedAt: query.endCreatedAt,
    };

    const response = await this.generatePdfExpensesUsecase.execute(input);
    return GeneratePdfExpensesPresenter.toHttp(response);
  }
}
