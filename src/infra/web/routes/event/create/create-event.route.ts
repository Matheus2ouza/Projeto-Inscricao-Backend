import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateEventUseCase } from 'src/usecases/event/create/create-event.usecase';
import type { CreateEventInput } from 'src/usecases/event/create/create-event.usecase';
import type {
  CreateEventRequest,
  CreateEventRouteResponse,
} from './create-event.dto';
import { CreateEventPresenter } from './create-event.presenter';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';

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
      image: request.image, // imagem pode ser enviada como base64 ou url, depende do frontend
    };

    const result = await this.createEventUseCase.execute(input);

    const response = CreateEventPresenter.toHttp(result);
    console.log(response);
    return response;
  }
}
