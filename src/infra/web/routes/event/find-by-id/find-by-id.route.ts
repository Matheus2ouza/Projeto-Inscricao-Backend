import { Controller, Get, Param } from '@nestjs/common';
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
  @Get(':id') // Mude de 'me' para ':id' como parâmetro de rota
  public async handle(
    @Param() params: FindByIdEventRequest, // Mude de @Query para @Param
  ): Promise<FindByIdEventOutput> {
    const id = String(params.id);
    console.log('O ID do evento');
    console.log(id);
    const result = await this.findByIdEventUsecase.execute({ id });

    const response = FindByEventPresenter.toHttp(result);

    return response;
  }
}
