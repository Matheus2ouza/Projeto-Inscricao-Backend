import { Body, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { SyncTokenGuard } from 'src/infra/web/authenticator/guards/sync-token.guard';
import {
  ReceiveSyncOnSiteRegistrationInput,
  ReceiveSyncOnSiteRegistrationUsecase,
} from 'src/usecases/web/sync/receive-sync-on-site-registration/receive-sync-on-site-registration.usecase';
import {
  ReceiveSyncOnSiteRegistrationBody,
  ReceiveSyncOnSiteRegistrationResponse,
} from './receive-sync-on-site-registration.dto';
import { ReceiveSyncOnSiteRegistrationPresenter } from './receive-sync-on-site-registration.presenter';

export class ReceiveSyncOnSiteRegistrationRoute {
  constructor(
    private readonly receiveSyncOnSiteRegistrationUsecase: ReceiveSyncOnSiteRegistrationUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('onSiteRegistration')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: ReceiveSyncOnSiteRegistrationBody,
  ): Promise<ReceiveSyncOnSiteRegistrationResponse> {
    const input: ReceiveSyncOnSiteRegistrationInput = {
      onSiteRegistration: body.onSiteRegistration,
    };

    const response =
      await this.receiveSyncOnSiteRegistrationUsecase.execute(input);

    return ReceiveSyncOnSiteRegistrationPresenter.toHttp(response);
  }
}
