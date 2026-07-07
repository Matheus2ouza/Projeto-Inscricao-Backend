import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  FindBySlugEventInput,
  FindBySlugEventUsecase,
} from 'src/usecases/web/event/find-by-slug/find-by-slug.usecase';
import {
  FindBySlugEventRequest,
  FindBySlugEventResponse,
} from './find-by-slug.dto';
import { FindBySlugPresenter } from './find-by-slug.presenter';

@Controller('events')
export class FindBySlugEventRoute {
  public constructor(
    private readonly findBySlugEventUsecase: FindBySlugEventUsecase,
  ) {}

  @IsPublic()
  @Get('slug/:slug')
  public async handle(
    @Param() params: FindBySlugEventRequest,
  ): Promise<FindBySlugEventResponse> {
    const input: FindBySlugEventInput = {
      slug: params.slug,
    };
    const response = await this.findBySlugEventUsecase.execute(input);
    return FindBySlugPresenter.toHttp(response);
  }
}
