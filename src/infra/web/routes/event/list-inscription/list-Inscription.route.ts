import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListInscriptionUsecase } from 'src/usecases/event/list-inscription/list-Inscription.usecase';
import type {
  ListInscriptionRequest,
  ListInscriptionResponse,
} from './list-Inscription.dto';
import { ListInscriptionPresenter } from './list-Inscription.presenter';

@Controller('events')
export class ListInscriptionRoute {
  public constructor(
    private readonly listInscriptionUsecase: ListInscriptionUsecase,
  ) {}

  @Get(':id/inscriptions')
  public async handle(
    @Param('id') id: string,
    @Query() query: ListInscriptionRequest,
  ): Promise<ListInscriptionResponse> {
    const response = await this.listInscriptionUsecase.execute({
      eventId: id,
      page: query.page,
      pageSize: query.pageSize,
    });

    return ListInscriptionPresenter.toHttp(response);
  }
}
