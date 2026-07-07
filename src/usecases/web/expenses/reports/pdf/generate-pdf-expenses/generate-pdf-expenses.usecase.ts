import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CategoryExpense, PaymentMethod } from 'generated/prisma';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  ExpensesByCategory,
  ListExpensesPdfData,
  ListExpensesPdfGeneratorUtils,
} from 'src/shared/utils/pdfs/expenses/list-expenses-pdf-generator.utils';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type GeneratePdfExpensesInput = {
  eventId: string;

  // filtros
  category?: CategoryExpense[];
  paymentMethod?: PaymentMethod[];
  startCreatedAt?: Date | string;
  endCreatedAt?: Date | string;
};

export type CategorySummary = {
  category: CategoryExpense;
  count: number;
  totalValue: number;
};

export type GeneratePdfExpensesOutput = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf';
};

@Injectable()
export class GeneratePdfExpensesUsecase
  implements Usecase<GeneratePdfExpensesInput, GeneratePdfExpensesOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfExpensesInput,
  ): Promise<GeneratePdfExpensesOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to generate expense report, but an invalid event ID was displayed. ${input.eventId}`,
        `Evento não encontrado`,
        GeneratePdfExpensesUsecase.name,
      );
    }

    const filters = {
      category: input.category,
      paymentMethod: input.paymentMethod,
      startCreatedAt: input.startCreatedAt,
      endCreatedAt: input.endCreatedAt,
    };

    const expenses = await this.eventExpensesGateway.findExpensesForReport(
      event.getId(),
      filters,
    );

    const categorySummary = await this.eventExpensesGateway.summarizeByCategory(
      undefined,
      event.getId(),
    );

    // Formata os gastos para o PDF
    const formattedExpenses = expenses.map((expense) => ({
      description: expense.getDescription(),
      value: expense.getValue(),
      paymentMethod: expense.getPaymentMethod(),
      responsible: expense.getResponsible(),
      category: expense.getCategory(),
      createdAt: expense.getCreatedAt(),
    }));

    // Agrupa gastos por categoria (apenas com os gastos filtrados)
    const expensesByCategory = this.groupExpensesByCategory(formattedExpenses);

    // Converte o categorySummary para o formato esperado pelo PDF
    const categorySummaryForPdf = this.convertCategorySummary(categorySummary);

    // Calcula o total de gastos
    const totalExpenses = formattedExpenses.reduce(
      (sum, expense) => sum + expense.value,
      0,
    );

    // Obtém a imagem do evento em base64
    const eventImageBase64 = await this.getImageBase64(event.getImageUrl());

    const pdfData: ListExpensesPdfData = {
      header: {
        title: event.getName() ?? 'Evento',
        titleDetail: this.formatEventPeriod(
          event.getStartDate(),
          event.getEndDate(),
        ),
        subtitle: 'Relatório de Gastos',
        image: eventImageBase64 || undefined,
      },
      expensesByCategory,
      categorySummary: categorySummaryForPdf,
      totalExpenses,
      totalExpensesFormatted: this.formatCurrency(totalExpenses),
    };

    const pdfBuffer =
      await ListExpensesPdfGeneratorUtils.generateListExpensesPdf(pdfData);

    const filename = `Relatorio-Despesas-${event
      .getName()
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      fileBase64: pdfBuffer.toString('base64'),
      filename,
      contentType: 'application/pdf',
    };
  }

  private convertCategorySummary(
    categorySummary: Array<{
      category: CategoryExpense;
      count: number;
      totalValue: number;
    }>,
  ) {
    return categorySummary
      .map((item) => ({
        category: item.category,
        categoryFormatted: this.formatCategory(item.category),
        count: item.count,
        totalValue: item.totalValue,
        totalFormatted: this.formatCurrency(item.totalValue),
      }))
      .sort((a, b) => a.categoryFormatted.localeCompare(b.categoryFormatted));
  }

  private groupExpensesByCategory(
    expenses: Array<{
      description: string;
      value: number;
      paymentMethod: PaymentMethod;
      responsible: string;
      category: CategoryExpense;
      createdAt: Date | string;
    }>,
  ): ExpensesByCategory[] {
    const groupedByCategory = new Map<CategoryExpense, ExpensesByCategory>();

    for (const expense of expenses) {
      const category = expense.category;
      const existing = groupedByCategory.get(category);

      if (existing) {
        existing.expenses.push(expense);
        existing.totalByCategory += expense.value;
        existing.totalByCategoryFormatted = this.formatCurrency(
          existing.totalByCategory,
        );
      } else {
        groupedByCategory.set(category, {
          category,
          categoryFormatted: this.formatCategory(category),
          expenses: [expense],
          totalByCategory: expense.value,
          totalByCategoryFormatted: this.formatCurrency(expense.value),
        });
      }
    }

    // Retorna as categorias ordenadas pelo nome
    return Array.from(groupedByCategory.values()).sort((a, b) =>
      a.categoryFormatted.localeCompare(b.categoryFormatted),
    );
  }

  private formatEventPeriod(
    startDate?: Date | null,
    endDate?: Date | null,
  ): string | undefined {
    const formattedStart = startDate
      ? new Date(startDate).toLocaleDateString('pt-BR')
      : undefined;
    const formattedEnd = endDate
      ? new Date(endDate).toLocaleDateString('pt-BR')
      : undefined;

    if (formattedStart && formattedEnd) {
      return `${formattedStart} até ${formattedEnd}`;
    }

    return formattedStart ?? formattedEnd ?? undefined;
  }

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }

  private async getImageBase64(path?: string): Promise<string> {
    const publicUrl = await this.getPublicUrl(path);
    if (!publicUrl) {
      return '';
    }

    try {
      const response = await axios.get<ArrayBuffer>(publicUrl, {
        responseType: 'arraybuffer',
      });

      const base64Image = Buffer.from(response.data).toString('base64');
      return `data:image/jpeg;base64,${base64Image}`;
    } catch {
      return '';
    }
  }

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private formatCategory(category: CategoryExpense): string {
    const categoryMap: Record<CategoryExpense, string> = {
      BRINDES: 'Brindes',
      COZINHA: 'Cozinha',
      DECORACAO: 'Decoração',
      DECORACAO_ESTACAO: 'Decoração Estação',
      DECORACAO_COMPERADORES: 'Decoração Cooperadores',
      MIDIA: 'Mídia',
      SOM: 'Som',
      MANUTENCAO: 'Manutenção',
      SEGURANCA: 'Segurança',
      OUTROS: 'Outros',
    };
    return categoryMap[category] || String(category);
  }
}
