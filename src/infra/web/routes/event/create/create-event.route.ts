import { Body, Controller, Post } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { CreateEventInput } from 'src/usecases/web/event/create/create-event.usecase';
import { CreateEventUseCase } from 'src/usecases/web/event/create/create-event.usecase';
import { RegionIdNotFoundRouteException } from '../../exceptions/event/region-id-not-found.route.exception';
import type {
  CreateEventRequest,
  CreateEventRouteResponse,
} from './create-event.dto';
import { CreateEventPresenter } from './create-event.presenter';

@Controller('events')
export class CreateEventRoute {
  public constructor(private readonly createEventUseCase: CreateEventUseCase) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Post('create')
  public async handle(
    @Body() body: CreateEventRequest,
    @UserInfo() user: UserInfoType,
  ): Promise<CreateEventRouteResponse> {
    // Caso o roler do user que está criando o evento seja SUPER então pega o id da região do body da requisição
    const regionId =
      user.userRole === roleType.SUPER ? body.regionId : user.regionId;

    if (!regionId) {
      throw new RegionIdNotFoundRouteException(
        `Tentativa de criar evento sem regionId definido. userRole: ${user.userRole}, user.regionId: ${user.regionId ?? 'ausente'}, body.regionId: ${body.regionId ?? 'ausente'}`,
        `Infelizmente não foi possível identificar a região a qual o evento vai ser vinculado`,
        CreateEventRoute.name,
      );
    }

    const input: CreateEventInput = {
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
      regionId,
      image: body.image,
      location: body.location,
      longitude: body.longitude,
      latitude: body.latitude,
      status: body.status,
      allowedInscriptionModes: body.allowedInscriptionModes,
      allowedPaymentModes: body.allowedPaymentModes,
      participantFieldsConfig: body.participantFieldsConfig,
      paymentEnabled: body.paymentEnabled,
      responsibles: body.responsibles,
    };

    const result = await this.createEventUseCase.execute(input);

    const response = CreateEventPresenter.toHttp(result);
    return response;
  }
}
