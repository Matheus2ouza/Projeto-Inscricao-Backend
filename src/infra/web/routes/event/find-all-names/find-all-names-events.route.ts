import { Controller, Get } from '@nestjs/common';
import { FindAllnamesEventUsecase } from 'src/usecases/event/find-all-names/find-all-names.usecase';
import { FindAllNamesEventResponse } from './find-all-names-events.dto';
import { FindAllNamesEventPresenter } from './find-all-names-events.presenter';

@Controller('events')
export class FindAllNamesEventRoute {
  public constructor(
    private readonly findAllnamesEventUsecase: FindAllnamesEventUsecase,
  ) {}

  @Get('all/names')
  public async handle(): Promise<FindAllNamesEventResponse> {
    const result = await this.findAllnamesEventUsecase.execute();
    const response = FindAllNamesEventPresenter.toHttp(result);
    return response;
  }
}
