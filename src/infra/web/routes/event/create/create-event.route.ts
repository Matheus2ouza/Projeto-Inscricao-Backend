import { Body, Controller, Post, Req } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { CreateEventInput } from 'src/usecases/web/event/create/create-event.usecase';
import { CreateEventUseCase } from 'src/usecases/web/event/create/create-event.usecase';
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
    @Body() request: CreateEventRequest,
    @Req() req,
  ): Promise<CreateEventRouteResponse> {
    const input: CreateEventInput = {
      name: request.name,
      startDate: request.startDate,
      endDate: request.endDate,
      regionId: request.regionId,
      image: request.image,
      location: request.location,
      longitude: request.longitude,
      latitude: request.latitude,
      status: request.status,
      paymentEnabled: request.paymentEnabled,
      responsibles: request.responsibles,
    };

    const result = await this.createEventUseCase.execute(input);

    const response = CreateEventPresenter.toHttp(result);
    return response;
  }
}
