import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindTotalExpenseInput = {
  regionId: string;
  eventId?: string;
};

export type FindTotalExpenseOutput = {
  totalExpense: number;
};

@Injectable()
export class FindTotalExpenseUsecase
  implements Usecase<FindTotalExpenseInput, FindTotalExpenseOutput>
{
  constructor(private readonly eventGateway: EventGateway) {}

  async execute(input: FindTotalExpenseInput): Promise<FindTotalExpenseOutput> {
    const event = input.eventId
      ? await this.eventGateway.findById(input.eventId)
      : await this.eventGateway.findNextUpcomingEvent(input.regionId);

    if (!event) {
      return {
        totalExpense: 0,
      };
    }

    const output: FindTotalExpenseOutput = {
      totalExpense: event.getAmountSpent(),
    };

    return output;
  }
}
