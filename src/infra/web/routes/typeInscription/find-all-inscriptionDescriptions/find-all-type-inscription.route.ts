import { Controller, Get } from '@nestjs/common';
import { FindAllTypeInscriptionUsecase } from 'src/usecases/web/typeInscription/find-all-inscription/find-all-inscription.usecase';
import { FindAllTypeInscriptionResponse } from './find-all-type-inscription.dto';
import { FindAllTypeInscriptionPresenter } from './find-all-type-inscription.presenter';

@Controller('type-inscription')
export class FindAllTypeInscriptionRoute {
  public constructor(
    private readonly findAllTypeInscriptionUsecase: FindAllTypeInscriptionUsecase,
  ) {}

  @Get('all')
  async handle(): Promise<FindAllTypeInscriptionResponse> {
    const result = await this.findAllTypeInscriptionUsecase.execute();
    const response = FindAllTypeInscriptionPresenter.toHttp(result);

    return response;
  }
}
