import { Injectable } from '@nestjs/common';
import { CashEntryOrigin, CashEntryType } from 'generated/prisma';
import { Account } from 'src/domain/entities/account.entity';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { CashRegisterReportPdfGeneratorUtils } from 'src/shared/utils/pdfs/cash-register-report-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import {
  FindDetailsCashRegisterInput,
  FindDetailsCashRegisterUsecase,
} from '../../find-details-cash-register/find-details-cash-register.usecase';

export type GenerateReportPdfInput = {
  id: string;

  // filters
  favorite?: boolean;
};

export type GenerateReportPdfOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GenerateReportPdfUsecase
  implements Usecase<GenerateReportPdfInput, GenerateReportPdfOutput>
{
  public constructor(
    private readonly findDetailsCashRegisterUsecase: FindDetailsCashRegisterUsecase,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly userGateway: AccountGateway,
  ) {}

  public async execute(
    input: GenerateReportPdfInput,
  ): Promise<GenerateReportPdfOutput> {
    const detailsInput: FindDetailsCashRegisterInput = { id: input.id };
    const cashRegisterDetails =
      await this.findDetailsCashRegisterUsecase.execute(detailsInput);

    const moviments = input.favorite
      ? await this.cashRegisterEntryGateway.findAllMovementsFavorites(
          input.id,
          input.favorite,
        )
      : await this.collectAllMoviments(input.id);

    const mappedMoviments = await Promise.all(
      moviments.map(async (m, idx) => {
        let responsible: Account | null = null;
        if (m.getOrigin() !== CashEntryOrigin.ASAAS && m.getResponsible()) {
          responsible = await this.userGateway.findById(m.getResponsible()!);
        }

        let category: string | undefined;
        if (m.getType() === CashEntryType.EXPENSE && m.getEventExpenseId()) {
          const expense = await this.eventExpensesGateway.findById(
            m.getEventExpenseId()!,
          );
          category = expense?.getCategory();
        }

        return {
          index: idx + 1,
          type: String(m.getType()),
          method: String(m.getMethod()),
          origin: String(m.getOrigin()),
          value: m.getValue(),
          createdAt: m.getCreatedAt(),
          responsible: responsible?.getUsername() || m.getResponsible(),
          description: m.getDescription(),
          category,
        };
      }),
    );

    const pdfBuffer =
      await CashRegisterReportPdfGeneratorUtils.generateReportPdf({
        cashRegister: {
          id: cashRegisterDetails.id,
          name: cashRegisterDetails.name,
          status: cashRegisterDetails.status,
          balance: cashRegisterDetails.balance,
          initialBalance: cashRegisterDetails.initialBalance,
          totalIncome: cashRegisterDetails.totalIncome,
          totalExpense: cashRegisterDetails.totalExpense,
          totalCash: cashRegisterDetails.totalCash,
          totalCard: cashRegisterDetails.totalCard,
          totalPix: cashRegisterDetails.totalPix,
          openedAt: cashRegisterDetails.openedAt,
          closedAt: cashRegisterDetails.closedAt,
        },
        favoriteReport: input.favorite ?? false,
        moviments: mappedMoviments,
      });

    const filename = `Relatorio-Caixa-${cashRegisterDetails.name
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename,
    };
  }

  private async collectAllMoviments(cashRegisterId: string) {
    const pageSize = 20;
    let page = 1;
    const all: CashRegisterEntry[] = [];

    while (true) {
      const [moviments, totalMoviments] = await Promise.all([
        this.cashRegisterEntryGateway.findManyPaginated(
          cashRegisterId,
          page,
          pageSize,
          { orderBy: 'desc' },
        ),
        this.cashRegisterEntryGateway.countAll(cashRegisterId),
      ]);

      all.push(...moviments);

      const pageCount = Math.max(1, Math.ceil(totalMoviments / pageSize));
      if (page >= pageCount) break;
      page += 1;
    }

    return all;
  }
}
