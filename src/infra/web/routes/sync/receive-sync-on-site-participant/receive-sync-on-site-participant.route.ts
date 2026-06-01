import { Body, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { SyncTokenGuard } from 'src/infra/web/authenticator/guards/sync-token.guard';
import {
  ReceiveSyncOnSiteParticipantInput,
  ReceiveSyncOnSiteParticipantUsecase,
} from 'src/usecases/web/sync/receive-sync-on-site-participant/receive-sync-on-site-participant.usecase';
import {
  ReceiveSyncOnSiteParticipantBody,
  ReceiveSyncOnSiteParticipantResponse,
} from './receive-sync-on-site-participant.dto';
import { ReceiveSyncOnSiteParticipantPresenter } from './receive-sync-on-site-participant.presenter';

export class ReceiveSyncOnSiteParticipantRoute {
  constructor(
    private readonly receiveSyncOnSiteParticipantUsecase: ReceiveSyncOnSiteParticipantUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('inscriptions')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: ReceiveSyncOnSiteParticipantBody,
  ): Promise<ReceiveSyncOnSiteParticipantResponse> {
    const input: ReceiveSyncOnSiteParticipantInput = {
      onSiteParticipant: body.onSiteParticipant,
    };

    const response =
      await this.receiveSyncOnSiteParticipantUsecase.execute(input);

    return ReceiveSyncOnSiteParticipantPresenter.toHttp(response);
  }
}
