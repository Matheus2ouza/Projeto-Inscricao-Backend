import { Controller, Get } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { FindEventCarouselUsecase } from 'src/usecases/event/find-event-carousel/find-event-carousel.usecase';
import { FindEventCarouselResponse } from './find-event-carousel.dto';
import { FindEventCarousePresenter } from './find-event-carousel.presenter';

@Controller('events')
export class FindEventCarouselRoute {
  public constructor(
    private readonly findEventCarouselUsecase: FindEventCarouselUsecase,
  ) {}

  @IsPublic()
  @Get('carousel')
  public async execute(): Promise<FindEventCarouselResponse> {
    const result = await this.findEventCarouselUsecase.execute();

    const response = FindEventCarousePresenter.toHttp(result);
    return response;
  }
}
