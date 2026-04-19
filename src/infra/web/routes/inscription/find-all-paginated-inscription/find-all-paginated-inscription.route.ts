import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { roleType } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllPaginatedInscriptionInput,
  FindAllPaginatedInscriptionsUsecase,
} from 'src/usecases/web/inscription/find-all-paginated-inscription/find-all-paginated-inscription.usecase';
import {
  type FindAllPaginatedInscriptionRequest,
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
    const isGuestFilter =
      query.isGuest === undefined
        ? undefined
        : query.isGuest === false || query.isGuest === 'false'
          ? false
          : query.isGuest === true || query.isGuest === 'true'
            ? true
            : undefined;

    const input: FindAllPaginatedInscriptionInput = {
      eventId: param.eventId,
      userId: user.userRole === roleType.USER ? user.userId : undefined,
      status: query.status,
      isGuest: user.userRole !== roleType.USER ? isGuestFilter : false,
      orderByCreatedAt: query.orderByCreatedAt || 'desc',
      orderByResponsible: query.orderByResponsible || 'desc',
      endDate: query.endDate,
      responsible: query.responsible,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response =
      await this.findAllPaginatedInscriptionsUsecase.execute(input);
    return FindAllPaginatedInscriptionPresenter.toHttp(response);
  }
}
