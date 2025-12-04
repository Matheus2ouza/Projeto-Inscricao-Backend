import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  GeneratePdfParticipantsAllInput,
  GeneratePdfParticipantsAllUsecase,
} from 'src/usecases/web/participants/pdf/generate-pdf-participant/generate-pdf-participants-all.usecase';
import {
  GeneratePdfParticipantsSelectedAccountsInput,
  GeneratePdfParticipantsSelectedAccountsUsecase,
} from 'src/usecases/web/participants/pdf/generate-pdf-participant/generate-pdf-participants-selected-accounts.usecase';
import type {
  GeneratePdfAllParticipantsAllRequest,
  GeneratePdfAllParticipantsAllResponse,
  GeneratePdfParticipantsAllBody,
} from './dto/generate-pdf-participants-all.dto';
import type {
  GeneratePdfParticipantsSelectedAccountsBody,
  GeneratePdfParticipantsSelectedAccountsParams,
  GeneratePdfParticipantsSelectedAccountsResponse,
} from './dto/generate-pdf-participants-selected-accounts.dto';
import { GeneratePdfParticipantsAllPresenter } from './presenter/generate-pdf-participants-all.presenter';
import { GeneratePdfParticipantsSelectedAccountsPresenter } from './presenter/generate-pdf-participants-selected-accounts.presenter';

@Controller('participants/pdf')
export class GeneratePdfSelectedParticipantRoute {
  public constructor(
    private readonly generatePdfParticipantsAllUsecase: GeneratePdfParticipantsAllUsecase,
    private readonly generatePdfParticipantsSelectedAccountsUsecase: GeneratePdfParticipantsSelectedAccountsUsecase,
  ) {}

  @Post(':eventId/list-participants/all')
  async handleAll(
    @Param() params: GeneratePdfAllParticipantsAllRequest,
    @Body() body?: GeneratePdfParticipantsAllBody,
  ): Promise<GeneratePdfAllParticipantsAllResponse> {
    const input: GeneratePdfParticipantsAllInput = {
      eventId: params.eventId,
      genders: body?.genders,
    };

    const response =
      await this.generatePdfParticipantsAllUsecase.execute(input);
    return GeneratePdfParticipantsAllPresenter.toHttp(response);
  }

  @Post(':eventId/list-participants/selected')
  async handleSelected(
    @Param() params: GeneratePdfParticipantsSelectedAccountsParams,
    @Body() body: GeneratePdfParticipantsSelectedAccountsBody,
  ): Promise<GeneratePdfParticipantsSelectedAccountsResponse> {
    const input: GeneratePdfParticipantsSelectedAccountsInput = {
      eventId: params.eventId,
      accountsId: body.accountsId,
      genders: body.genders,
    };
    const response =
      await this.generatePdfParticipantsSelectedAccountsUsecase.execute(input);

    return GeneratePdfParticipantsSelectedAccountsPresenter.toHttp(response);
  }
}
