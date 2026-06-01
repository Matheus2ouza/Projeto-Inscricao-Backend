import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import { SyncTokenGuard } from 'src/infra/web/authenticator/guards/sync-token.guard';
import {
  ReceiveSyncCashRegisterInput,
  ReceiveSyncCashRegisterUsecase,
} from 'src/usecases/web/sync/receive-sync-cash-register/receive-sync-cash-register.usecase';
import {
  ReceiveSyncCashRegisterBody,
  ReceiveSyncCashRegisterResponse,
} from './receive-sync-cash-register.dto';
import { ReceiveSyncCashRegisterPresenter } from './receive-sync-cash-register.presenter';

@Controller('sync')
export class ReceiveSyncCashRegisterRoute {
  constructor(
    private readonly receiveSyncCashRegisterUsecase: ReceiveSyncCashRegisterUsecase,
  ) {}

  @IsPublic()
  @UseGuards(SyncTokenGuard)
  @Post('cashRegister')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: ReceiveSyncCashRegisterBody,
  ): Promise<ReceiveSyncCashRegisterResponse> {
    const input: ReceiveSyncCashRegisterInput = {
      cashRegister: body.cashRegister,
    };

    const response = await this.receiveSyncCashRegisterUsecase.execute(input);
    return ReceiveSyncCashRegisterPresenter.toHttp(response);
  }
}
