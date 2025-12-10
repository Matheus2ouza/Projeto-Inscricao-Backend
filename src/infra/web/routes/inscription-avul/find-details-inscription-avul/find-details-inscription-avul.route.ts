import { Controller, Get, Param } from '@nestjs/common';
import {
  FindDetailsInscriptionAvulInput,
  FindDetailsInscriptionAvulUsecase,
} from 'src/usecases/web/inscription/avul/find-details-inscription-avul/find-details-inscription-avul.usecase';
import type {
  FindDetailsInscriptionAvulRequest,
  FindDetailsInscriptionAvulResponse,
} from './find-details-inscription-avul.dto';
import { FindDetailsInscriptionAvulPresenter } from './find-details-inscription-avul.presenter';

@Controller('inscriptions/avul')
export class findDetailsInscriptionAvulRoute {
  constructor(
    private readonly findDetailsInscriptionAvulUsecase: FindDetailsInscriptionAvulUsecase,
  ) {}

  @Get(':inscriptionId/details')
  async handle(
    @Param() params: FindDetailsInscriptionAvulRequest,
  ): Promise<FindDetailsInscriptionAvulResponse> {
    const input: FindDetailsInscriptionAvulInput = {
      id: params.inscriptionId,
    };

    const response =
      await this.findDetailsInscriptionAvulUsecase.execute(input);
    return FindDetailsInscriptionAvulPresenter.toHttp(response);
  }
}
