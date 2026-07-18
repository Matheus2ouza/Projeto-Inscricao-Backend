import { Injectable } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  CategoryExpense,
  PaymentMethod,
} from 'generated/prisma';
import { Account } from 'src/domain/entities/account/account.entity';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { CashRegisterReportPdfGeneratorUtils } from 'src/shared/utils/pdfs/cash-register-report-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { FindDetailsCashRegisterUsecase } from 'src/usecases/web/cash-register/find-details-cash-register/find-details-cash-register.usecase';
import { CashRegisterNotFoundUsecaseException } from 'src/usecases/web/exceptions/cash-register/cash-register-not-found.usecase.exception';

export type GenerateReportPdfInput = {
  id: string;

  // filtros
  listExpenseCategory: boolean;
  moviments: boolean;
  favorite: boolean;
};

export type GenerateReportPdfOutput = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};

type CategorySummary = {
  category: CategoryExpense;
  count: number;
  totalValue: number;
};

type MovimentsMapper = {
  index: number;
  type: CashEntryType;
  method: PaymentMethod;
  origin: CashEntryOrigin;
  value: number;
  createdAt: Date;
  responsible?: string;
  description?: string;
  category?: CategoryExpense;
};

@Injectable()
export class GenerateReportPdfUsecase
  implements Usecase<GenerateReportPdfInput, GenerateReportPdfOutput>
{
  public constructor(
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly userGateway: AccountGateway,
  ) {}

  public async execute(
    input: GenerateReportPdfInput,
  ): Promise<GenerateReportPdfOutput> {
    const cashRegister = await this.cashRegisterGateway.findById(input.id);

    if (!cashRegister) {
      throw new CashRegisterNotFoundUsecaseException(
        `Attempt to create a cash register report by ID ${input.id}, but no cash register was found.`,
        `Nenhum caixa encontrado`,
        FindDetailsCashRegisterUsecase.name,
      );
    }

    const filters = {
      favorite: input.favorite,
    };
    let moviments: CashRegisterEntry[] | [] = [];

    if (input.moviments) {
      moviments = await this.cashRegisterEntryGateway.findAllMovements(
        cashRegister.getId(),
        filters,
      );
    }

    const movimentsMapper = await this.mapMoviments(moviments);

    const [
      totalIncome,
      totalExpense,
      totalPix,
      totalCard,
      totalCash,
      methodOriginTotals,
    ] = await Promise.all([
      this.cashRegisterEntryGateway.sumTotalIncome(cashRegister.getId()),
      this.cashRegisterEntryGateway.sumTotalExpense(cashRegister.getId()),
      this.cashRegisterEntryGateway.sumTotalByMethod(
        cashRegister.getId(),
        PaymentMethod.PIX,
      ),
      this.cashRegisterEntryGateway.sumTotalByMethod(
        cashRegister.getId(),
        PaymentMethod.CARTAO,
      ),
      this.cashRegisterEntryGateway.sumTotalByMethod(
        cashRegister.getId(),
        PaymentMethod.DINHEIRO,
      ),
      this.cashRegisterEntryGateway.sumByMethodAndOrigin(cashRegister.getId()),
    ]);

    // Obtém o resumo por categoria se o filtro listExpenseCategory for true
    let categorySummary: CategorySummary[] | undefined;
    if (input.listExpenseCategory) {
      categorySummary = await this.eventExpensesGateway.summarizeByCategory(
        input.id,
      );
    }

    const fileBase =
      await CashRegisterReportPdfGeneratorUtils.generateReportPdf({
        cashRegister: {
          id: cashRegister.getId(),
          name: cashRegister.getName(),
          status: cashRegister.getStatus(),
          balance: cashRegister.getBalance(),
          initialBalance: cashRegister.getInitialBalance(),
          totalIncome,
          totalExpense,
          totalCash,
          totalCard,
          totalPix,
          openedAt: cashRegister.getOpenedAt(),
          closedAt: cashRegister.getClosedAt(),
        },
        favoriteReport: input.favorite ?? false,
        moviments: movimentsMapper,
        includeMovements: input.moviments,
        categorySummary,
        methodOriginTotals,
      });

    const filename = `Relatorio-Caixa-${cashRegister
      .getName()
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      fileBase64: fileBase.toString('base64'),
      filename,
      contentType: 'application/pdf',
    };
  }

  private async mapMoviments(
    moviments: CashRegisterEntry[],
  ): Promise<MovimentsMapper[]> {
    return Promise.all(
      moviments.map(async (m, idx) => {
        let responsible: Account | null = null;

        if (m.getOrigin() !== CashEntryOrigin.ASAAS && m.getResponsible()) {
          responsible = await this.userGateway.findById(m.getResponsible()!);
        }

        let category: CategoryExpense | undefined = undefined;
        if (m.getType() === CashEntryType.EXPENSE && m.getEventExpenseId()) {
          const expense = await this.eventExpensesGateway.findById(
            m.getEventExpenseId()!,
          );

          category = expense?.getCategory();
        }

        return {
          index: idx + 1,
          type: m.getType(),
          method: m.getMethod(),
          origin: m.getOrigin(),
          value: m.getValue(),
          createdAt: m.getCreatedAt(),
          responsible: responsible?.getUsername() || m.getResponsible(),
          description: m.getDescription(),
          category,
        };
      }),
    );
  }
}
