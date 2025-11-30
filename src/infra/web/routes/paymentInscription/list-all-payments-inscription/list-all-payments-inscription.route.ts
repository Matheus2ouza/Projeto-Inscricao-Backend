import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListAllPaymentsInscriptionInput,
  ListAllPaymentsInscriptionUsecase,
} from 'src/usecases/web/paymentInscription/list-all-payments-inscription/list-all-payments-inscription.usecase';
import type {
  ListAllPaymentsInscriptionRequest,
  ListAllPaymentsInscriptionResponse,
} from './list-all-payments-inscription.dto';
import { ListAllPaymentsInscriptionPresenter } from './list-all-payments-inscription.presenter';

@Controller('payments')
export class ListAllPaymentsInscriptionRoute {
  constructor(
    private readonly ListAllPaymentsInscriptionUsecase: ListAllPaymentsInscriptionUsecase,
  ) {}

  @Get(':eventId/list')
  async handle(
    @Param() param: ListAllPaymentsInscriptionRequest,
    @Query() query: ListAllPaymentsInscriptionRequest,
  ): Promise<ListAllPaymentsInscriptionResponse> {
    const input: ListAllPaymentsInscriptionInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };
    const response =
      await this.ListAllPaymentsInscriptionUsecase.execute(input);
    return ListAllPaymentsInscriptionPresenter.toHttp(response);
  }
}
