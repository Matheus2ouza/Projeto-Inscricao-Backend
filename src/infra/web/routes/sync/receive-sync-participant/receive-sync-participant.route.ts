import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { SyncTokenGuard } from 'src/infra/web/authenticator/guards/sync-token.guard';
import { ReceiveSyncParticipantUsecase } from 'src/usecases/web/sync/receive-sync-participant/receive-sync-participant.usecase';
import { ReceiveSyncParticipantBody } from './receive-sync-participant.dto';
import { ReceiveSyncParticipantMapper } from './receive-sync-participant.mapper';
import { ReceiveSyncParticipantPresenter } from './receive-sync-participant.presenter';

@Controller('sync')
export class ReceiveSyncParticipantRoute {
  private readonly logger = new Logger(ReceiveSyncParticipantRoute.name);
  constructor(
    private readonly receiveSyncParticipantUsecase: ReceiveSyncParticipantUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('participants')
  @HttpCode(HttpStatus.OK)
  async handle(@Body() body: ReceiveSyncParticipantBody) {
    this.logger.log(
      `Recebendo dados do participante para sincronizacao ${body.record.id}`,
    );

    const participant = ReceiveSyncParticipantMapper.toEntity(body.record);

    const response = await this.receiveSyncParticipantUsecase.execute({
      participant,
    });

    return ReceiveSyncParticipantPresenter.toHttp(response);
  }
}
