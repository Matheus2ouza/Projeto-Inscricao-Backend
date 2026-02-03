import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  FindByIdEventInput,
  FindByIdEventUsecase,
} from 'src/usecases/web/event/find-by-id/find-by-id.usecase';
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
    const input: FindByIdEventInput = {
      id: params.id,
    };
    const result = await this.findByIdEventUsecase.execute(input);
    return FindByEventPresenter.toHttp(result);
  }
}
