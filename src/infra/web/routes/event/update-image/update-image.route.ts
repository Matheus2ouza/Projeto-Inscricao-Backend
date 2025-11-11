import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdateImageEventInput,
  UpdateImageEventUsecase,
} from 'src/usecases/event/update-image/update-image-event.usecase';
import type {
  UpdateImageRequest,
  UpdateImageResponse,
} from './update-image.dto';
import { UpdateImagePresenter } from './update-image.presenter';

@Controller('events')
export class UpdateImageRoute {
  public constructor(
    private readonly updateImageUsecase: UpdateImageEventUsecase,
  ) {}

  @Patch(':id/update/image')
  async handle(
    @Param('id') id: string,
    @Body() body: Pick<UpdateImageRequest, 'image'>,
  ): Promise<UpdateImageResponse> {
    const input: UpdateImageEventInput = {
      eventId: id,
      image: body.image,
    };

    const result = await this.updateImageUsecase.execute(input);
    const response = UpdateImagePresenter.toHttp(result);
    return response;
  }
}
