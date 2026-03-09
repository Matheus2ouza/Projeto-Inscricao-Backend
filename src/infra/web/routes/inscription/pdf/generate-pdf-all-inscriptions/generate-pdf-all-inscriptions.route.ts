import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import {
  GeneratePdfAllInscriptionsInput,
  GeneratePdfAllInscriptionsUsecase,
} from 'src/usecases/web/inscription/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import type {
  GeneratePdfAllInscriptionsRequest,
  GeneratePdfAllInscriptionsResponse,
} from './generate-pdf-all-inscriptions.dto';
import { GeneratePdfAllInscriptionsPresenter } from './generate-pdf-all-inscriptions.presenter';

@Controller('inscriptions')
export class GeneratePdfAllInscriptionsRoute {
  constructor(
    private readonly generatePdfAllInscriptionsUsecase: GeneratePdfAllInscriptionsUsecase,
  ) {}

  @Get(':eventId/all/pdf')
  async handle(
    @Param() param: GeneratePdfAllInscriptionsRequest,
    @Query() query: GeneratePdfAllInscriptionsRequest,
  ): Promise<GeneratePdfAllInscriptionsResponse> {
    const input: GeneratePdfAllInscriptionsInput = {
      eventId: param.eventId,
      participants: query.participants === 'true',
      payment: query.payment === 'true',
      status: query.status as InscriptionStatus | InscriptionStatus[],
      statusPayment: query.statusPayment as StatusPayment | StatusPayment[],
      methodPayment: query.methodPayment as PaymentMethod | PaymentMethod[],
      isGuest: query.isGuest === 'true',
      limitTime: query.limitTime,
    };

    const response =
      await this.generatePdfAllInscriptionsUsecase.execute(input);
    return GeneratePdfAllInscriptionsPresenter.toHttp(response);
  }
}
