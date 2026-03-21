import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import {
  GeneratePdfAllInscriptionsInput,
  GeneratePdfAllInscriptionsUsecase,
} from 'src/usecases/web/inscription/reports/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import type {
  GenerateAllInscriptionsRequest,
  GenerateAllInscriptionsResponse,
} from './generate-all-inscriptions.dto';
import { GenerateAllInscriptionsPresenter } from './generate-all-inscriptions.presenter';

@Controller('inscriptions')
export class GeneratePdfAllInscriptionsRoute {
  constructor(
    private readonly generatePdfAllInscriptionsUsecase: GeneratePdfAllInscriptionsUsecase,
  ) {}

  @Get(':eventId/all/pdf')
  async handle(
    @Param() param: GenerateAllInscriptionsRequest,
    @Query() query: GenerateAllInscriptionsRequest,
  ): Promise<GenerateAllInscriptionsResponse> {
    const isGuest =
      query.isGuest === undefined ||
      query.isGuest === true ||
      query.isGuest === 'true'
        ? undefined
        : query.isGuest === false || query.isGuest === 'false'
          ? false
          : undefined;

    const input: GeneratePdfAllInscriptionsInput = {
      eventId: param.eventId,
      participants:
        query.participants === true || query.participants === 'true',
      payment: query.payment === true || query.payment === 'true',
      status: query.status as InscriptionStatus | InscriptionStatus[],
      statusPayment: query.statusPayment as StatusPayment | StatusPayment[],
      methodPayment: query.methodPayment as PaymentMethod | PaymentMethod[],
      isGuest,
      startDate: query.startDate,
      endDate: query.endDate,
    };

    const response =
      await this.generatePdfAllInscriptionsUsecase.execute(input);
    return GenerateAllInscriptionsPresenter.toHttp(response);
  }
}
