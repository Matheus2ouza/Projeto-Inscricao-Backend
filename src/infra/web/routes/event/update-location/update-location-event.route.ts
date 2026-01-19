import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdateLocationEventInput,
  UpdateLocationEventUsecase,
} from 'src/usecases/web/event/update-location/update-location-event.usecase';
import type {
  UpdateLocationEventRequest,
  UpdateLocationEventResponse,
} from './update-location-event.dto';
import { UpdateLocationEventPresenter } from './update-location-event.presenter';

@Controller('events')
export class UpdateLocationEventRoute {
  public constructor(
    private readonly updateLocationEventUsecase: UpdateLocationEventUsecase,
  ) {}

  @Patch(':id/update/location')
  async hadle(
    @Param('id') id: string,
    @Body() body: UpdateLocationEventRequest,
  ): Promise<UpdateLocationEventResponse> {
    const input: UpdateLocationEventInput = {
      eventId: id,
      location: body.location,
    };

    const result = await this.updateLocationEventUsecase.execute(input);
    return UpdateLocationEventPresenter.toHttp(result);
  }
}
