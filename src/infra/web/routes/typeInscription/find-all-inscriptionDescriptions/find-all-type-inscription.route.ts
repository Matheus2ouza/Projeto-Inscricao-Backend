import { Controller, Get } from '@nestjs/common';
import { FindAllInscriptionUsecase } from 'src/usecases/web/typeInscription/find-all-inscription/find-all-inscription.usecase';
import { FindAllInscriptionResponse } from './find-all-type-inscription.dto';
import { FindAllInscriptionPresenter } from './find-all-type-inscription.presenter';

@Controller('type-inscription')
export class FindAllInscriptionRoute {
  public constructor(
    private readonly findAllInscriptionUsecase: FindAllInscriptionUsecase,
  ) {}

  @Get('all')
  async handle(): Promise<FindAllInscriptionResponse> {
    const result = await this.findAllInscriptionUsecase.execute();
    const response = FindAllInscriptionPresenter.toHttp(result);

    return response;
  }
}
