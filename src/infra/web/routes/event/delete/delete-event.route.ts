import { Controller, Delete, Param } from '@nestjs/common';
import {
  DeleteEventInput,
  DeleteEventUsecase,
} from 'src/usecases/web/event/delete/delete-event.usecase';

@Controller('events')
export class DeleteEventRoute {
  public constructor(private readonly deleteEventUsecase: DeleteEventUsecase) {}

  @Delete(':id')
  public async handle(@Param('id') id: string) {
    const input: DeleteEventInput = {
      eventId: id,
    };

    await this.deleteEventUsecase.execute(input);
  }
}
