import { Body, Controller, Post } from '@nestjs/common';
import {
  GeneratePdfRoomInput,
  GeneratePdfRoomUsecase,
} from 'src/usecases/web/participants/reports/pdf/generate-pdf-room/generate-pdf-room.usecase';
import {
  GeneratePdfRoomBody,
  GeneratePdfRoomResponse,
} from './generate-pdf-room.dto';
import { GeneratePdfRoomPresenter } from './generate-pdf-room.presenter';

@Controller('participants/pdf')
export class GeneratePdfRoomRoute {
  constructor(
    private readonly GeneratePdfRoomUsecase: GeneratePdfRoomUsecase,
  ) {}

  @Post('room')
  async handle(
    @Body() body: GeneratePdfRoomBody,
  ): Promise<GeneratePdfRoomResponse> {
    const input: GeneratePdfRoomInput = {
      title: body.title,
      observation: body.observation,
      listParticipants: body.listParticipants,
    };

    const response = await this.GeneratePdfRoomUsecase.execute(input);
    return GeneratePdfRoomPresenter.toHttp(response);
  }
}
