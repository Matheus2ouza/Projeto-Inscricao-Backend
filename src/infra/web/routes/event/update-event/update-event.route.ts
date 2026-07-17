import { Body, Controller, Param, Put } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { UpdateEventInput } from 'src/usecases/web/event/update-event/update-event.usecase';
import { UpdateEventUsecase } from 'src/usecases/web/event/update-event/update-event.usecase';
import type {
  UpdateEventBody,
  UpdateEventParam,
  UpdateEventRouteResponse,
} from './update-event.dto';
import { UpdateEventPresenter } from './update-event.presenter';

@Controller('events')
export class UpdateEventRoute {
  public constructor(private readonly updateEventUseCase: UpdateEventUsecase) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Put(':id')
  public async handle(
    @Param() param: UpdateEventParam,
    @Body() request: UpdateEventBody,
  ): Promise<UpdateEventRouteResponse> {
    const input: UpdateEventInput = {
      id: param.id,
      name: request.name,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
      longitude: request.longitude,
      latitude: request.latitude,
    };

    const response = await this.updateEventUseCase.execute(input);
    return UpdateEventPresenter.toHttp(response);
  }
}
