import { Controller, Delete, Param } from '@nestjs/common';
import {
  DeleteEventInput,
  DeleteEventUsecase,
} from 'src/usecases/web/event/delete/delete-event.usecase';
import type { DeleteEventRequest } from './delete-event.dto';

@Controller('events')
export class DeleteEventRoute {
  public constructor(private readonly deleteEventUsecase: DeleteEventUsecase) {}

  @Delete(':id')
  public async handle(@Param('id') param: DeleteEventRequest) {
    const input: DeleteEventInput = {
      eventId: param.eventId,
    };

    await this.deleteEventUsecase.execute(input);
  }
}
