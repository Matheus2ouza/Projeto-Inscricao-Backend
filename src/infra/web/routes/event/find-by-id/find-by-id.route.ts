import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { FindByIdEventUsecase } from 'src/usecases/event/find-by-id/find-by-id.usecase';
import type {
  FindByIdEventRequest,
  FindByIdEventResponse,
} from './find-by-id.dto';
import { FindByEventPresenter } from './find-by-id.presenter';

@Controller('events')
export class FindByIdEventRoute {
  public constructor(
    private readonly findByIdEventUsecase: FindByIdEventUsecase,
  ) {}

  @IsPublic()
  @Get(':id')
  public async handle(
    @Param() params: FindByIdEventRequest,
  ): Promise<FindByIdEventResponse> {
    const id = String(params.id);
    const result = await this.findByIdEventUsecase.execute({ id });

    const response = FindByEventPresenter.toHttp(result);

    return response;
  }
}
