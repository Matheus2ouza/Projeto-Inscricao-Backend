import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdatePaymentModeEventInput,
  UpdatePaymentModeEventUsecase,
} from 'src/usecases/web/event/update-payment-mode/update-payment-mode-event.usecase';
import {
  UpdatePaymentModeEventBody,
  UpdatePaymentModeEventParam,
  UpdatePaymentModeEventResponse,
} from './update-payment-mode-event.dto';
import { UpdatePaymentModeEventPresenter } from './update-payment-mode-event.presenter';

@Controller('events')
export class UpdatePaymentModeEventRoute {
  public constructor(
    private readonly updatePaymentModeEventUsecase: UpdatePaymentModeEventUsecase,
  ) {}

  @Patch(':id/update/payment-mode')
  public async handle(
    @Param() param: UpdatePaymentModeEventParam,
    @Body() body: UpdatePaymentModeEventBody,
  ): Promise<UpdatePaymentModeEventResponse> {
    const input: UpdatePaymentModeEventInput = {
      eventId: param.id,
      paymentMode: body.paymentMode,
    };

    const response = await this.updatePaymentModeEventUsecase.execute(input);
    return UpdatePaymentModeEventPresenter.toHttp(response);
  }
}
