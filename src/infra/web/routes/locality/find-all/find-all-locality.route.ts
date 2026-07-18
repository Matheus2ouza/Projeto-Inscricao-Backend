import { Controller, Get } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { FindAllLocalityUsecase } from 'src/usecases/web/locality/find-all-by-event/find-all-locality.usecase';
import { FindAllLocalityResponse } from './find-all-locality.dto';
import { FindAllLocalityPresenter } from './find-all-locality.presenter';

@Controller('locality')
export class FindAllLocalityRoute {
  public constructor(
    private readonly findAllLocalityUsecase: FindAllLocalityUsecase,
  ) {}

  @IsPublic()
  @Get('all')
  public async handle(): Promise<FindAllLocalityResponse> {
    const response = await this.findAllLocalityUsecase.execute();
    return FindAllLocalityPresenter.toHttp(response);
  }
}
