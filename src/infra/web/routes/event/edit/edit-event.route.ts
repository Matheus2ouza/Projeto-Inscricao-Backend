import { Body, Controller, Param, Put } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import type { EditEventInput } from 'src/usecases/event/edit/edit-event.usecase';
import { EditEventUseCase } from 'src/usecases/event/edit/edit-event.usecase';
import type {
  EditEventRequest,
  EditEventRouteResponse,
} from './edit-event.dto';
import { EditEventPresenter } from './edit-event.presenter';

@Controller('events')
export class EditEventRoute {
  public constructor(private readonly editEventUseCase: EditEventUseCase) {}

  @Roles(RoleTypeHierarchy.ADMIN)
  @Put(':id')
  public async handle(
    @Param('id') id: string,
    @Body() request: EditEventRequest,
  ): Promise<EditEventRouteResponse> {
    const input: EditEventInput = {
      id: id,
      name: request.name,
      startDate: request.startDate,
      endDate: request.endDate,
      location: request.location,
      longitude: request.longitude,
      latitude: request.latitude,
      responsibles: request.responsibles,
    };

    const result = await this.editEventUseCase.execute(input);

    const response = EditEventPresenter.toHttp(result);
    return response;
  }
}
