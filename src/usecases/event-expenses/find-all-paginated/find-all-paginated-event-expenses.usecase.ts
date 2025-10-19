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
  expenses: {
    id: string;
    eventId: string;
    description: string;
    value: number;
    paymentMethod: PaymentMethod;
    responsible: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  total: number;
  page: number;
  pageCount: number;
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

    const [rows, total] = await Promise.all([
      this.eventExpensesGateway.findManyPaginated(
        safePage,
        safePageSize,
        input.eventId,
      ),
      this.eventExpensesGateway.countAll(input.eventId),
    ]);

    return {
      expenses: rows.map((expense) => ({
        id: expense.getId(),
        eventId: expense.getEventId(),
        description: expense.getDescription(),
        value: expense.getValue(),
        paymentMethod: expense.getPaymentMethod(),
        responsible: expense.getResponsible(),
        createdAt: expense.getCreatedAt(),
        updatedAt: expense.getUpdatedAt(),
      })),
      total,
      page: safePage,
      pageCount: Math.max(1, Math.ceil(total / safePageSize)),
    };
  }
}
