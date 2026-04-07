import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalDebtAdminInput = {
  regionId: string;
  eventId?: string;
};

export type FindTotalDebtAdminOutput = {
  totalDebt: number;
};

@Injectable()
export class FindTotalDebtAdminUsecase
  implements Usecase<FindTotalDebtAdminInput, FindTotalDebtAdminOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  public async execute(
    input: FindTotalDebtAdminInput,
  ): Promise<FindTotalDebtAdminOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalDebt: 0,
      };
    }

    const inscriptionsDebt = await this.inscriptionGateway.contTotalDebtByEvent(
      event.getId(),
    );

    const paymentsDebt = await this.paymentGateway.countTotalToReceiveByEvent(
      event.getId(),
    );

    const totalDebt = inscriptionsDebt + paymentsDebt;

    const output: FindTotalDebtAdminOutput = {
      totalDebt,
    };

    return output;
  }
}
