import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdateLogoEventInput,
  UpdateLogoEventUsecase,
} from 'src/usecases/web/event/update-logo/update-logo.usecase';
import {
  UpdateLogoEventRequest,
  UpdateLogoEventResponse,
} from './update-logo.dto';
import { UpdateLogoEventPresenter } from './update-logo.presenter';

@Controller('events')
export class UpdateLogoEventRoute {
  public constructor(
    private readonly updateLogoEventUsecase: UpdateLogoEventUsecase,
  ) {}

  @Patch(':id/update/logo')
  async handle(
    @Param('id') eventId: string,
    @Body() body: Pick<UpdateLogoEventRequest, 'image'>,
  ): Promise<UpdateLogoEventResponse> {
    const input: UpdateLogoEventInput = {
      eventId,
      image: body.image,
    };

    const response = await this.updateLogoEventUsecase.execute(input);
    return UpdateLogoEventPresenter.toHttp(response);
  }
}
