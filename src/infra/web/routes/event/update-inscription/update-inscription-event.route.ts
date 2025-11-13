import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateInscriptionEventUsecase } from 'src/usecases/web/event/update-inscription/update-inscription-event.usecase';
import { UpdateInscriptionEventResponse } from './update-inscription-event.dto';
import { UpdateInscriptionEventPresenter } from './update-inscription-event.presenter';

@Controller('events')
export class UpdateInscriptionEventRoute {
  public constructor(
    private readonly updateInscriptionEventUsecase: UpdateInscriptionEventUsecase,
  ) {}

  @Patch(':id/update/inscriptions')
  async handle(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<UpdateInscriptionEventResponse> {
    const response = await this.updateInscriptionEventUsecase.execute({
      eventId: id,
      InscriptionStatus: status,
    });
    return UpdateInscriptionEventPresenter.toHttp(response);
  }
}
