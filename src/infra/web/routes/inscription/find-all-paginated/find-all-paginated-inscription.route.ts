import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import { FindAllPaginatedInscriptionsUsecase } from 'src/usecases/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import type {
  FindAllPaginatedInscriptionRequest,
  FindAllPaginatedInscriptionResponse,
} from './find-all-paginated-inscription.dto';
import { FindAllPaginatedInscriptionPresenter } from './find-all-paginated-inscription.presenter';

@Controller('inscriptions')
export class FindAllPaginatedInscriptionsRoute {
  public constructor(
    private readonly findAllPaginatedInscriptionsUsecase: FindAllPaginatedInscriptionsUsecase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista todas as inscrições do usuário autenticado (paginadas)',
    description:
      'Retorna uma lista paginada de inscrições vinculadas ao usuário autenticado. ' +
      'É possível filtrar os resultados opcionalmente por **período de tempo (`limitTime`)** e **evento específico (`eventId`)**.',
  })
  public async handle(
    @Query() query: FindAllPaginatedInscriptionRequest,
    @UserId() accountId: string,
  ): Promise<FindAllPaginatedInscriptionResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const data = {
      userId: accountId,
      page,
      pageSize,
      limitTime: query.limitTime,
      eventId: query.eventId,
    };

    const result = await this.findAllPaginatedInscriptionsUsecase.execute(data);

    return FindAllPaginatedInscriptionPresenter.toHttp(result);
  }
}
