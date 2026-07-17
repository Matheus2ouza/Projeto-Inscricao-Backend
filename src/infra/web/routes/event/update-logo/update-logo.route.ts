import {
  Controller,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UpdateLogoEventInput,
  UpdateLogoEventUsecase,
} from 'src/usecases/web/event/update-logo/update-logo.usecase';
import { UpdateLogoEventResponse } from './update-logo.dto';
import { UpdateLogoEventPresenter } from './update-logo.presenter';

@Controller('events')
export class UpdateLogoEventRoute {
  public constructor(
    private readonly updateLogoEventUsecase: UpdateLogoEventUsecase,
  ) {}

  @Patch(':id/update/logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // limite máximo de 5mb,
    }),
  )
  async handle(
    @Param('id') eventId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateLogoEventResponse> {
    const input: UpdateLogoEventInput = {
      eventId,
      file: {
        buffer: file.buffer,
        mimeType: file.mimetype,
      },
    };

    const response = await this.updateLogoEventUsecase.execute(input);
    return UpdateLogoEventPresenter.toHttp(response);
  }
}
