import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { FindDetailsInscriptionUsecase } from 'src/usecases/inscription/find-details-inscription/find-details-inscription.usecase';
import type {
  FindDetailsInscriptionRequest,
  FindDetailsInscriptionResponse,
} from './find-details-inscription.dto';
import { FindDetailsInscriptionPresenter } from './find-details-inscription.presenter';

@Controller('inscriptions')
export class FindDetailsInscriptionRoute {
  public constructor(
    private readonly findDetailsInscriptionUsecase: FindDetailsInscriptionUsecase,
  ) {}

  @IsPublic()
  @Get(':id')
  async handle(
    @Param() params: FindDetailsInscriptionRequest,
  ): Promise<FindDetailsInscriptionResponse> {
    const id = String(params.id);
    const result = await this.findDetailsInscriptionUsecase.execute({ id });
    const response = FindDetailsInscriptionPresenter.toHttp(result);
    return response;
  }
}
