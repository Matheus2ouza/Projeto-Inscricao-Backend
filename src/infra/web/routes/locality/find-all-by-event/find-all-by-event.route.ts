import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  FindAllByEventInput,
  FindAllByEventUsecase,
} from 'src/usecases/web/locality/find-all-by-event/find-all-by-event.usecase';
import {
  FindAllByEventParam,
  FindAllByEventResponse,
} from './find-all-by-event.dto';
import { FindAllByEventPresenter } from './find-all-by-event.presenter';

@Controller('locality')
export class FindAllByEventRoute {
  public constructor(
    private readonly findAllByEventUsecase: FindAllByEventUsecase,
  ) {}

  @IsPublic()
  @Get('event/:eventId')
  public async handle(
    @Param() param: FindAllByEventParam,
  ): Promise<FindAllByEventResponse> {
    const input: FindAllByEventInput = {
      eventId: param.eventId,
    };

    const response = await this.findAllByEventUsecase.execute(input);
    return FindAllByEventPresenter.toHttp(response);
  }
}
