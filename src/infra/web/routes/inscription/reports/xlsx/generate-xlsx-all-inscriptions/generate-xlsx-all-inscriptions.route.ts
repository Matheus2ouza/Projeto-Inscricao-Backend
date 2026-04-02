import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { GeneratePdfAllInscriptionsInput } from 'src/usecases/web/inscription/reports/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import { GenerateXlsxAllInscriptionsUsecase } from 'src/usecases/web/inscription/reports/xlsx/generate-xlsx-all-inscriptions/generate-xlsx-all-inscriptions.usecase';
import type {
  GenerateXlsxAllInscriptionsParms,
  GenerateXlsxAllInscriptionsQuery,
  GenerateXlsxAllInscriptionsResponse,
} from './generate-xlsx-all-inscriptions.dto';
import { GenerateXlsxAllInscriptionsPresenter } from './generate-xlsx-all-inscriptions.presenter';

@Controller('inscriptions')
export class GenerateXlsxAllInscriptionsRoute {
  constructor(
    private readonly generateXlsxAllInscriptionsUsecase: GenerateXlsxAllInscriptionsUsecase,
  ) {}

  @Get(':eventId/all/xlsx')
  async handle(
    @Param() param: GenerateXlsxAllInscriptionsParms,
    @Query() query: GenerateXlsxAllInscriptionsQuery,
  ): Promise<GenerateXlsxAllInscriptionsResponse> {
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
      await this.generateXlsxAllInscriptionsUsecase.execute(input);
    return GenerateXlsxAllInscriptionsPresenter.toHttp(response);
  }
}
