import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type UpdatePaymentInput = {
  eventId: string;
  paymentStatus: boolean;
};

export type UpdatePaymentOutput = {
  id: string;
  paymentStatus: boolean;
};

@Injectable()
export class UpdatePaymentEventUsecase
  implements Usecase<UpdatePaymentInput, UpdatePaymentOutput>
{
  public constructor(private readonly eventGateway: EventGateway) {}

  async execute(Input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    console.log(Input);
    const event = await this.eventGateway.updatePayment(
      Input.eventId,
      Input.paymentStatus,
    );

    return {
      id: event.getId(),
      paymentStatus: event.getPaymentEnabled(),
    };
  }
}
