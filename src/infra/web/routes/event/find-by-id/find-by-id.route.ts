import { Controller, Get, Query } from '@nestjs/common';
import { FindByIdEventUsecase } from 'src/usecases/event/findById/find-by-id.usecase';
import type {
  FindByIdEventOutput,
  FindByIdEventRequest,
} from './find-by-id.dto';
import { FindByEventPresenter } from './find-by-id.presenter';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';

@Controller('events')
export class FindByIdEventRoute {
  public constructor(
    private readonly findByIdEventUsecase: FindByIdEventUsecase,
  ) {}

  @IsPublic()
  @Get('me')
  public async handle(
    @Query() query: FindByIdEventRequest,
  ): Promise<FindByIdEventOutput> {
    const id = String(query.id);
    const result = await this.findByIdEventUsecase.execute({ id });

    const response = FindByEventPresenter.toHttp(result);

    return response;
  }
}
