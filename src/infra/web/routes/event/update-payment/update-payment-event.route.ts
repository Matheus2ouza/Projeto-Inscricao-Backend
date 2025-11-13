import { Body, Controller, Param, ParseBoolPipe, Patch } from '@nestjs/common';
import { UpdatePaymentEventUsecase } from 'src/usecases/web/event/update-payment/update-payment.usecase';
import { UpdatePaymentEventResponse } from './update-payment-event.dto';
import { UpdatePaymentEventPresenter } from './update-payment-event.presenter';

@Controller('events')
export class UpdatePaymentEventRoute {
  public constructor(
    private readonly updatePaymentEventUsecase: UpdatePaymentEventUsecase,
  ) {}

  @Patch(':id/update/payments')
  public async handle(
    @Param('id') id: string,
    @Body('status', ParseBoolPipe) status: boolean,
  ): Promise<UpdatePaymentEventResponse> {
    const response = await this.updatePaymentEventUsecase.execute({
      eventId: id,
      paymentStatus: status,
    });
    return UpdatePaymentEventPresenter.toHttp(response);
  }
}
