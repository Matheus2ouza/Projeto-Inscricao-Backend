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
import { ReceiveSyncInscriptionUsecase } from 'src/usecases/web/sync/receive-sync-inscription/receive-sync-inscription.usecase';
import { ReceiveSyncInscriptionBody } from './receive-sync-inscription.dto';
import { ReceiveSyncInscriptionMapper } from './receive-sync-inscription.mapper';
import { ReceiveSyncInscriptionPresenter } from './receive-sync-inscription.presenter';

@Controller('sync')
export class ReceiveSyncInscriptionRoute {
  private readonly logger = new Logger(ReceiveSyncInscriptionRoute.name);
  constructor(
    private readonly receiveSyncInscriptionUsecase: ReceiveSyncInscriptionUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('inscriptions')
  @HttpCode(HttpStatus.OK)
  async handle(@Body() body: ReceiveSyncInscriptionBody) {
    this.logger.log(
      `Recebendo dados de inscrição para sincronizacao ${body.record.id}`,
    );

    const inscription = ReceiveSyncInscriptionMapper.toEntity(body.record);

    const response = await this.receiveSyncInscriptionUsecase.execute({
      inscription,
    });

    return ReceiveSyncInscriptionPresenter.toHttp(response);
  }
}
