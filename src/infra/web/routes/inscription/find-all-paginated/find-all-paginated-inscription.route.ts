import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { roleType } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedInscriptionInput,
  FindAllPaginatedInscriptionsUsecase,
} from 'src/usecases/web/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import {
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
    const input: FindAllPaginatedInscriptionInput = {
      eventId: param.eventId,
      userId: user.userRole === roleType.USER ? user.userId : undefined,
      page: query.page,
      pageSize: query.pageSize,
      isGuest: user.userRole !== roleType.USER ? query.isGuest : false,
      orderBy: query.orderBy || 'desc',
      limitTime: query.limitTime,
    };

    const response =
      await this.findAllPaginatedInscriptionsUsecase.execute(input);
    return FindAllPaginatedInscriptionPresenter.toHttp(response);
  }
}
