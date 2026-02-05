import { Body, Controller, Param, Put } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { UpdateEventInput } from 'src/usecases/web/event/update-event/update-event.usecase';
import { UpdateEventUseCase } from 'src/usecases/web/event/update-event/update-event.usecase';
import type {
  UpdateEventRequest,
  UpdateEventRouteResponse,
} from './update-event.dto';
import { UpdateEventPresenter } from './update-event.presenter';

@Controller('events')
export class UpdateEventRoute {
  public constructor(private readonly updateEventUseCase: UpdateEventUseCase) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Put(':id')
  public async handle(
    @Param('id') id: string,
    @Body() request: UpdateEventRequest,
  ): Promise<UpdateEventRouteResponse> {
    const input: UpdateEventInput = {
      id: id,
      name: request.name,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
      longitude: request.longitude,
      latitude: request.latitude,
      responsibles: request.responsibles,
    };

    const response = await this.updateEventUseCase.execute(input);
    return UpdateEventPresenter.toHttp(response);
  }
}
