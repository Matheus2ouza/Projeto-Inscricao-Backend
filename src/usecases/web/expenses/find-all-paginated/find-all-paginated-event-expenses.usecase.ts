import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedEventExpensesInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedEventExpensesOutput = {
  expenses: Expense[];
  total: number;
  page: number;
  pageCount: number;
};

export type Expense = {
  id: string;
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  createdAt: Date;
};

@Injectable()
export class FindAllPaginatedEventExpensesUsecase
  implements
    Usecase<
      FindAllPaginatedEventExpensesInput,
      FindAllPaginatedEventExpensesOutput
    >
{
  public constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
  ) {}

  async execute(
    input: FindAllPaginatedEventExpensesInput,
  ): Promise<FindAllPaginatedEventExpensesOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(50, Math.floor(input.pageSize || 10)),
    );

    const [expensesArray, total] = await Promise.all([
      this.eventExpensesGateway.findManyPaginated(
        safePage,
        safePageSize,
        input.eventId,
      ),
      this.eventExpensesGateway.countAll(input.eventId),
    ]);

    const expenses: Expense[] = expensesArray.map((e) => {
      return {
        id: e.getId(),
        eventId: e.getEventId(),
        description: e.getDescription(),
        value: e.getValue(),
        paymentMethod: e.getPaymentMethod(),
        responsible: e.getResponsible(),
        createdAt: e.getCreatedAt(),
      };
    });

    return {
      expenses,
      total,
      page: safePage,
      pageCount: Math.max(1, Math.ceil(total / safePageSize)),
    };
  }
}
