import { Controller, Param, ParseBoolPipe, Put, Query } from '@nestjs/common';
import {
  UpdateAllowCardInput,
  UpdateAllowCardUseCase,
} from 'src/usecases/web/event/update-allow-card/update-allow-card.usecase';
import type { UpdateAllowCardResponse } from './update-allow-card.dto';
import { UpdateAllowCardPresenter } from './update-allow-card.presenter';

@Controller('events')
export class UpdateAllowCardRoute {
  constructor(
    private readonly updateAllowCardUseCase: UpdateAllowCardUseCase,
  ) {}

  @Put(':eventId/allow-card')
  async handle(
    @Param('eventId') eventId: string,
    @Query('allowCard', ParseBoolPipe) allowCard: boolean,
  ): Promise<UpdateAllowCardResponse> {
    const input: UpdateAllowCardInput = {
      eventId,
      allowCard,
    };

    const response = await this.updateAllowCardUseCase.execute(input);
    return UpdateAllowCardPresenter.toHttp(response);
  }
}
