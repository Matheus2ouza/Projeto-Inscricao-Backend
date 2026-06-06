import { Injectable } from '@nestjs/common';
import { CategoryExpense, PaymentMethod } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventExpensesNotFoundUsecaseException } from '../../exceptions/expense/event-expense-not-found.usecase.exception';

export type FindDetailsExpenseInput = {
  id: string;
};

export type FindDetailsExpenseOutput = {
  id: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  images: string[];
  createdAt: Date;
};

@Injectable()
export class FindDetailsExpenseUsecase
  implements Usecase<FindDetailsExpenseInput, FindDetailsExpenseOutput>
{
  constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindDetailsExpenseInput,
  ): Promise<FindDetailsExpenseOutput> {
    const expense = await this.eventExpensesGateway.findById(input.id);

    if (!expense) {
      throw new EventExpensesNotFoundUsecaseException(
        `Attempt to retrieve expense details, but the provided ID: ${input.id} returned no results.`,
        `Nenhum gasto encontrado`,
        FindDetailsExpenseUsecase.name,
      );
    }

    const images = await this.getPublicUrls(expense.getImageUrls());

    const output: FindDetailsExpenseOutput = {
      id: expense.getId(),
      description: expense.getDescription(),
      value: expense.getValue(),
      paymentMethod: expense.getPaymentMethod(),
      responsible: expense.getResponsible(),
      category: expense.getCategory(),
      images: images,
      createdAt: expense.getCreatedAt(),
    };
    return output;
  }

  private async getPublicUrls(paths: string[] = []): Promise<string[]> {
    if (!paths.length) {
      return [];
    }

    const publicUrls = await Promise.all(
      paths.map(async (path) => {
        try {
          return await this.supabaseStorageService.getPublicUrl(path);
        } catch {
          return '';
        }
      }),
    );

    return publicUrls.filter(Boolean);
  }
}
