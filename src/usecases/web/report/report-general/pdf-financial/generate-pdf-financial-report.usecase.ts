import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { ReportFinancialPdfGeneratorUtils } from 'src/shared/utils/pdfs/report-financial-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import {
  ReportFinancialOutput,
  ReportFinancialUsecase,
} from '../financial/report-financial.usecase';

export type GeneratePdfFinancialReportInput = {
  eventId: string;
  details: boolean;
};

export type GeneratePdfFinancialReportOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfFinancialReportUsecase
  implements
    Usecase<GeneratePdfFinancialReportInput, GeneratePdfFinancialReportOutput>
{
  public constructor(
    private readonly reportFinancialUsecase: ReportFinancialUsecase,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute({
    eventId,
    details,
  }: GeneratePdfFinancialReportInput): Promise<GeneratePdfFinancialReportOutput> {
    const reportData: ReportFinancialOutput =
      await this.reportFinancialUsecase.execute({ eventId, details });
    const eventImageDataUrl = await this.loadEventImage(
      reportData.logo ?? reportData.image,
    );

    const financialData = this.buildFinancialReportData(reportData);
    const pdfBuffer = details
      ? await ReportFinancialPdfGeneratorUtils.generateReportPdfDetailed(
          financialData,
          { eventImageDataUrl },
        )
      : await ReportFinancialPdfGeneratorUtils.generateReportPdf(
          financialData,
          { eventImageDataUrl },
        );

    const filename = `Relatório-Financeiro-${reportData.name
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    const pdfBase64 = pdfBuffer.toString('base64');

    return {
      pdfBase64,
      filename,
    };
  }

  private async loadEventImage(
    imagePath?: string | null,
  ): Promise<string | undefined> {
    if (!imagePath) return undefined;

    try {
      const signedUrl =
        await this.supabaseStorageService.getPublicUrl(imagePath);
      const response = await fetch(signedUrl);

      if (!response.ok) {
        console.warn(
          `Failed to load event image: ${response.status} ${response.statusText}`,
        );
        return undefined;
      }

      const arrayBuffer = await response.arrayBuffer();
      const mimeType = response.headers.get('content-type') ?? 'image/jpeg';
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn('Error while loading event image:', error);
      return undefined;
    }
  }

  private buildFinancialReportData(reportData: ReportFinancialOutput) {
    const inscricoesDetails =
      reportData.inscription.details?.map((d) => ({
        id: d.id,
        createdAt: d.createdAt,
        totalPaid: d.totalPaid,
        paidCash: d.paidCash,
        paidCard: d.paidCard,
        paidPix: d.paidPix,
      })) ?? [];

    const avulsDetails =
      reportData.inscriptionAvuls.details?.map((d) => ({
        id: d.id,
        createdAt: d.createdAt,
        totalPaid: d.totalPaid,
        paidCash: d.paidCash,
        paidCard: d.paidCard,
        paidPix: d.paidPix,
      })) ?? [];

    const gastosDetails =
      reportData.spent.spentDetails?.map((g) => ({
        id: g.id,
        createdAt: g.createdAt,
        totalSpent: g.totalSpent,
      })) ?? [];

    return {
      event: {
        name: reportData.name,
        startDate: reportData.startDate,
        endDate: reportData.endDate,
      },
      totais: {
        totalGeral: reportData.totalGeral,
        totalDinheiro: reportData.totalCash,
        totalCartao: reportData.totalCard,
        totalPix: reportData.totalPix,
        totalGastos: reportData.totalSpent,
      },
      inscricoes: {
        total: reportData.inscription.totalGeral,
        totalDinheiro: reportData.inscription.totalCash,
        totalCartao: reportData.inscription.totalCard,
        totalPix: reportData.inscription.totalPix,
        totalParticipantes: reportData.inscription.countParticipants,
        inscricoes: inscricoesDetails,
      },
      inscricoesAvulsas: {
        total: reportData.inscriptionAvuls.totalGeral,
        totalDinheiro: reportData.inscriptionAvuls.totalCash,
        totalCartao: reportData.inscriptionAvuls.totalCard,
        totalPix: reportData.inscriptionAvuls.totalPix,
        totalParticipantes: reportData.inscriptionAvuls.countParticipants,
        inscricoes: avulsDetails,
      },
      ticketsSale: {
        totalGeral: reportData.ticketsSale?.totalGeral ?? 0,
        countTickets: reportData.ticketsSale?.countTickets ?? 0,
        totalDinheiro: reportData.ticketsSale?.totalCash ?? 0,
        totalCartao: reportData.ticketsSale?.totalCard ?? 0,
        totalPix: reportData.ticketsSale?.totalPix ?? 0,
        details:
          reportData.ticketsSale?.details?.map((d) => ({
            name: d.name,
            quantity: d.quantity,
            pricePerTicket: d.pricePerTicket,
            totalCash: d.totalCash,
            totalCard: d.totalCard,
            totalPix: d.totalPix,
          })) ?? [],
      },
      gastos: {
        total: reportData.spent.totalGeral,
        totalDinheiro: reportData.spent.totalCash,
        totalCartao: reportData.spent.totalCard,
        totalPix: reportData.spent.totalPix,
        gastos: gastosDetails,
      },
    };
  }
}
