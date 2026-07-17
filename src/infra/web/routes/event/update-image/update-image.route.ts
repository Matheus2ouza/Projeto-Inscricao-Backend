import {
  Controller,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import {
  UpdateImageEventInput,
  UpdateImageEventUsecase,
} from 'src/usecases/web/event/update-image/update-image-event.usecase';
import type { UpdateImageResponse } from './update-image.dto';
import { UpdateImagePresenter } from './update-image.presenter';

@Controller('events')
export class UpdateImageEventRoute {
  public constructor(
    private readonly updateImageUsecase: UpdateImageEventUsecase,
  ) {}

  @Patch(':id/update/image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // limite máximo de 5mb,
    }),
  )
  async handle(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateImageResponse> {
    const input: UpdateImageEventInput = {
      eventId: id,
      file: {
        buffer: file.buffer,
        mimeType: file.mimetype,
      },
    };

    const result = await this.updateImageUsecase.execute(input);
    const response = UpdateImagePresenter.toHttp(result);
    return response;
  }
}
