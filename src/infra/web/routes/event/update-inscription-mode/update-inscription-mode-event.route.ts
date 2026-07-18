import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdateInscriptionModeEventInput,
  UpdateInscriptionModeEventUsecase,
} from 'src/usecases/web/event/update-inscription-mode/update-inscription-mode-event.usecase';
import {
  UpdateInscriptionModeEventBody,
  UpdateInscriptionModeEventParam,
  UpdateInscriptionModeEventResponse,
} from './update-inscription-mode-event.dto';
import { UpdateInscriptionModeEventPresenter } from './update-inscription-mode-event.presenter';

@Controller('events')
export class UpdateInscriptionModeEventRoute {
  public constructor(
    private readonly updateInscriptionModeEventUsecase: UpdateInscriptionModeEventUsecase,
  ) {}

  @Patch(':id/update/inscription-mode')
  public async handle(
    @Param() param: UpdateInscriptionModeEventParam,
    @Body() body: UpdateInscriptionModeEventBody,
  ): Promise<UpdateInscriptionModeEventResponse> {
    const input: UpdateInscriptionModeEventInput = {
      eventId: param.id,
      inscriptionMode: body.inscriptionMode,
    };
    console.log(input);

    const response =
      await this.updateInscriptionModeEventUsecase.execute(input);
    return UpdateInscriptionModeEventPresenter.toHttp(response);
  }
}
