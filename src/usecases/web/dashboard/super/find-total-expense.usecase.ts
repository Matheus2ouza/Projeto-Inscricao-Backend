import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalExpenseSuperInput = {
  regionId: string;
  eventId?: string;
};

export type FindTotalExpenseSuperOutput = {
  totalExpense: number;
};

@Injectable()
export class FindTotalExpenseSuperUsecase
  implements Usecase<FindTotalExpenseSuperInput, FindTotalExpenseSuperOutput>
{
  constructor(private readonly eventGateway: EventGateway) {}

  async execute(
    input: FindTotalExpenseSuperInput,
  ): Promise<FindTotalExpenseSuperOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalExpense: 0,
      };
    }

    const output: FindTotalExpenseSuperOutput = {
      totalExpense: event.getAmountSpent(),
    };

    return output;
  }
}
