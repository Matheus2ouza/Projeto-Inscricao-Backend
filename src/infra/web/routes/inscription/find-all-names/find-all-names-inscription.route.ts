import { Controller, Get, Param } from '@nestjs/common';
import {
  FindAllNamesInscriptionInput,
  FindAllNamesInscriptionUsecase,
} from 'src/usecases/web/inscription/find-all-names/find-all-names-inscription.usecase';
import {
  type FindAllNamesInscriptionRequest,
  FindAllNamesInscriptionResponse,
} from './find-all-names-inscription.dto';
import { FindAllNamesInscriptionPresenter } from './find-all-names-inscription.presenter';

@Controller('inscriptions')
export class FindAllNamesInscriptionRoute {
  constructor(
    private readonly findAllNamesInscriptionUsecase: FindAllNamesInscriptionUsecase,
  ) {}

  @Get(':eventId/all/names')
  async handle(
    @Param() param: FindAllNamesInscriptionRequest,
  ): Promise<FindAllNamesInscriptionResponse> {
    const input: FindAllNamesInscriptionInput = {
      eventId: param.eventId,
    };

    const response = await this.findAllNamesInscriptionUsecase.execute(input);
    return FindAllNamesInscriptionPresenter.toHttp(response);
  }
}
