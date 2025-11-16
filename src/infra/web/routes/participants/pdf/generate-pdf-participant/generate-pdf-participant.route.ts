import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  GeneratePdfSelectedParticipantInput,
  GeneratePdfSelectedParticipantUsecase,
} from 'src/usecases/web/participants/pdf/generate-pdf-participant/generate-pdf-participant.usecase';
import type {
  GeneratePdfSelectedParticipantRequest,
  GeneratePdfSelectedParticipantResponse,
} from './generate-pdf-participant.dto';
import { GeneratePdfSelectedParticipantPresenter } from './generate-pdf-participant.presenter';

@Controller('participants/pdf')
export class GeneratePdfSelectedParticipantRoute {
  public constructor(
    private readonly generatePdfSelectedParticipantUsecase: GeneratePdfSelectedParticipantUsecase,
  ) {}

  @Post(':id/list-participants')
  async handle(
    @Param('id') eventId: string,
    @Body() body: GeneratePdfSelectedParticipantRequest,
  ): Promise<GeneratePdfSelectedParticipantResponse> {
    const input: GeneratePdfSelectedParticipantInput = {
      eventId,
      accountsId: body.accountIds,
    };
    console;
    const response =
      await this.generatePdfSelectedParticipantUsecase.execute(input);

    return GeneratePdfSelectedParticipantPresenter.toHttp(response);
  }
}
