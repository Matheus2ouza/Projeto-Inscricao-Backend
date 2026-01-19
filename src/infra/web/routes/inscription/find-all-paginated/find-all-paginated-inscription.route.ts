import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedInscriptionInput,
  FindAllPaginatedInscriptionsUsecase,
} from 'src/usecases/web/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
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

  @Get(':eventId')
  @ApiOperation({
    summary:
      'Lista todas as inscrições do usuário autenticado para um evento específico (paginadas)',
    description:
      'Retorna uma lista paginada de inscrições vinculadas ao usuário autenticado para o evento especificado. ' +
      'É possível filtrar os resultados opcionalmente por **período de tempo (`limitTime`)**. O `eventId` é obrigatório e vem como parâmetro da rota.',
  })
  public async handle(
    @Param() param: FindAllPaginatedInscriptionRequest,
    @Query() query: FindAllPaginatedInscriptionRequest,
    @UserInfo() user: UserInfoType,
  ): Promise<FindAllPaginatedInscriptionResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const input: FindAllPaginatedInscriptionInput = {
      eventId: param.eventId,
      userId: user.userId,
      page,
      pageSize,
      limitTime: query.limitTime,
    };

    const result =
      await this.findAllPaginatedInscriptionsUsecase.execute(input);

    return FindAllPaginatedInscriptionPresenter.toHttp(result);
  }
}
