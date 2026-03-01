import { Injectable } from '@nestjs/common';
import { CashRegisterReportPdfGeneratorUtils } from 'src/shared/utils/pdfs/cash-register-report-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import {
  FindAllMovimentsCashRegisterInput,
  FindAllMovimentsCashRegisterUsecase,
} from '../../find-all-moviments-cash-register/find-all-moviments-cash-register.usecase';
import {
  FindDetailsCashRegisterInput,
  FindDetailsCashRegisterUsecase,
} from '../../find-details-cash-register/find-details-cash-register.usecase';

export type GenerateReportPdfInput = {
  id: string;
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
    private readonly findAllMovimentsCashRegisterUsecase: FindAllMovimentsCashRegisterUsecase,
  ) {}

  public async execute(
    input: GenerateReportPdfInput,
  ): Promise<GenerateReportPdfOutput> {
    const detailsInput: FindDetailsCashRegisterInput = { id: input.id };
    const cashRegisterDetails =
      await this.findDetailsCashRegisterUsecase.execute(detailsInput);

    const moviments = await this.fetchAllMoviments(input.id);

    const pdfBuffer =
      await CashRegisterReportPdfGeneratorUtils.generateReportPdf({
        cashRegister: {
          id: cashRegisterDetails.id,
          name: cashRegisterDetails.name,
          status: cashRegisterDetails.status,
          balance: cashRegisterDetails.balance,
          totalIncome: cashRegisterDetails.totalIncome,
          totalExpense: cashRegisterDetails.totalExpense,
          totalCash: cashRegisterDetails.totalCash,
          totalCard: cashRegisterDetails.totalCard,
          totalPix: cashRegisterDetails.totalPix,
          openedAt: cashRegisterDetails.openedAt,
          closedAt: cashRegisterDetails.closedAt,
        },
        moviments: moviments.map((m, idx) => ({
          index: idx + 1,
          method: String(m.method),
          origin: String(m.origin),
          value: m.value,
          createdAt: m.createdAt,
        })),
      });

    const filename = `Relatorio-Caixa-${cashRegisterDetails.name
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename,
    };
  }

  private async fetchAllMoviments(cashRegisterId: string) {
    const pageSize = 20;
    let page = 1;
    const all: Awaited<
      ReturnType<FindAllMovimentsCashRegisterUsecase['execute']>
    >['moviments'] = [];

    while (true) {
      const input: FindAllMovimentsCashRegisterInput = {
        id: cashRegisterId,
        page,
        pageSize,
        orderBy: 'desc',
      };

      const result =
        await this.findAllMovimentsCashRegisterUsecase.execute(input);

      all.push(...result.moviments);

      if (page >= result.pageCount) break;
      page += 1;
    }

    return all;
  }
}
