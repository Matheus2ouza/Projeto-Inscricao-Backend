import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindPaymentsDatesInput = {
  regionId: string;
};

export type FindPaymentsDatesOutput = {
  eventId: string;
  paymentId: string;
  installmentNumber: number;
  received: boolean;
  value: number;
  netValue: number;
  estimatedAt: Date;
}[];

@Injectable()
export class FindPaymentsDatesUsecase
  implements Usecase<FindPaymentsDatesInput, FindPaymentsDatesOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
  ) {}

  async execute(
    input: FindPaymentsDatesInput,
  ): Promise<FindPaymentsDatesOutput> {
    const installments = await this.paymentInstallmentGateway.findByRegionId(
      input.regionId,
    );

    const installmentDates = await Promise.all(
      installments.map(async (i) => {
        const event = await this.eventGateway.findByPaymentId(i.getPaymentId());

        return {
          eventId: event?.getId() ?? '',
          paymentId: i.getPaymentId(),
          installmentNumber: i.getInstallmentNumber(),
          received: i.getReceived(),
          value: i.getValue(),
          netValue: i.getNetValue(),
          estimatedAt: i.getEstimatedAt() ?? i.getPaidAt(),
        };
      }),
    );

    return installmentDates;
  }
}
