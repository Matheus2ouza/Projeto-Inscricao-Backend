import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SyncTokenGuard } from 'src/infra/web/authenticator/guards/sync-token.guard';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { ReceiveSyncInscriptionUsecase } from 'src/usecases/web/sync/receive-sync-inscription/receive-sync-inscription.usecase';

type ReceiveSyncInscriptionRequest = {
  record: Record<string, unknown>;
};

@Controller('sync')
export class ReceiveSyncInscriptionRoute {
  constructor(
    private readonly receiveSyncInscriptionUsecase: ReceiveSyncInscriptionUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('inscriptions')
  @HttpCode(HttpStatus.OK)
  async handle(@Body() body: ReceiveSyncInscriptionRequest) {
    const output = await this.receiveSyncInscriptionUsecase.execute({
      record: body.record,
    });

    return {
      status: 'ok',
      ...output,
    };
  }
}
