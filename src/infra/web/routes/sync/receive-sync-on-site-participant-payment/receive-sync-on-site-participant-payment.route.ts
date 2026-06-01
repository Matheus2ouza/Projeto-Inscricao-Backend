import { Body, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { SyncTokenGuard } from 'src/infra/web/authenticator/guards/sync-token.guard';
import {
  ReceiveSyncOnSiteParticipantPaymentInput,
  ReceiveSyncOnSiteParticipantPaymentUsecase,
} from 'src/usecases/web/sync/receive-sync-on-site-participant-payment/receive-sync-on-site-participant-payment.usecase';
import {
  ReceiveSyncOnSiteParticipantPaymentBody,
  ReceiveSyncOnSiteParticipantPaymentResponse,
} from './receive-sync-on-site-participant-payment.dto';
import { ReceiveSyncOnSiteParticipantPaymentPresenter } from './receive-sync-on-site-participant-payment.presenter';

export class ReceiveSyncOnSiteParticipantPaymentRoute {
  constructor(
    private readonly receiveSyncOnSiteParticipantPaymentUsecase: ReceiveSyncOnSiteParticipantPaymentUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('onSiteParticipantPayment')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: ReceiveSyncOnSiteParticipantPaymentBody,
  ): Promise<ReceiveSyncOnSiteParticipantPaymentResponse> {
    const input: ReceiveSyncOnSiteParticipantPaymentInput = {
      onSiteParticipantPayment: body.onSiteParticipantPayment,
    };

    const response =
      await this.receiveSyncOnSiteParticipantPaymentUsecase.execute(input);

    return ReceiveSyncOnSiteParticipantPaymentPresenter.toHttp(response);
  }
}
