import { Controller, Get } from '@nestjs/common';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindEventDateInput,
  FindEventDateUsecase,
} from 'src/usecases/web/event/find-event-dates/find-event-dates.usecase';
import { FindEventDateResponse } from './find-event-dates.dto';
import { FindEventDatePresenter } from './find-event-dates.presenter';

@Controller('events')
export class FindEventDateRoute {
  public constructor(
    private readonly findEventDateUsecase: FindEventDateUsecase,
  ) {}

  @Get('dates')
  public async handle(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindEventDateResponse> {
    const input: FindEventDateInput = {
      regionId: userInfo.regionId,
    };
    const response = await this.findEventDateUsecase.execute(input);
    return FindEventDatePresenter.toHttp(response);
  }
}
