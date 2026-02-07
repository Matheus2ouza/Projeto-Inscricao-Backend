import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { ReportGeneralPdfGeneratorUtils } from 'src/shared/utils/pdfs/report-general-pdf-generator.util';
import {
  ReportGeneralOutput,
  ReportGeneralUsecase,
} from '../general/report-general.usecase';

export type GeneratePdfGeneralReportInput = {
  eventId: string;
};

export type GeneratePdfGeneralReportOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfGeneralReportUsecase {
  public constructor(
    private readonly reportGeneralUsecase: ReportGeneralUsecase,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute({
    eventId,
  }: GeneratePdfGeneralReportInput): Promise<GeneratePdfGeneralReportOutput> {
    // Fetch report data
    const reportData: ReportGeneralOutput =
      await this.reportGeneralUsecase.execute({ eventId });
    const eventImageDataUrl = await this.loadEventImage(reportData.logo);

    // Generate PDF using pdfmake
    const pdfBuffer = await ReportGeneralPdfGeneratorUtils.generateReportPdf(
      this.buildLegacyReportData(reportData),
      { eventImageDataUrl },
    );

    const filename = `Relatório-${reportData.name
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    // 👇 convert Buffer to Base64 for frontend compatibility
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

  private buildLegacyReportData(reportData: ReportGeneralOutput) {
    const getMethodValue = (
      method: PaymentMethod,
      list: { paymentMethod: PaymentMethod; totalValue: number }[],
    ) => list.find((item) => item.paymentMethod === method)?.totalValue ?? 0;

    const typeInscriptionDetails = reportData.typeInscriptions.map((type) => ({
      responsible: type.description,
      countParticipants: 0,
      totalValue: 0,
      createdAt: reportData.startDate,
    }));

    const avulsDetails = [
      {
        responsible: 'Participantes avulsos',
        countParticipants: reportData.inscriptionAvuls.countParticipants,
        totalValue: reportData.inscriptionAvuls.totalValue,
        createdAt: reportData.startDate,
      },
    ];

    const ticketSales = reportData.ticketSale.byTicket.map((ticket) => ({
      name: ticket.ticketName,
      quantitySold: ticket.quantity,
      totalValue: ticket.totalValue,
      createdAt: reportData.startDate,
    }));

    const methodValue = (method: PaymentMethod) =>
      getMethodValue(method, reportData.inscriptionAvuls.byPaymentMethod) +
      getMethodValue(method, reportData.ticketSale.byPaymentMethod);

    const groupByMethod = (method: PaymentMethod) =>
      getMethodValue(
        method,
        reportData.inscriptions.flatMap((item) => item.byPaymentMethod),
      ) +
      getMethodValue(
        method,
        reportData.guestInscriptions.flatMap((item) => item.byPaymentMethod),
      );

    const totalGroupParticipants =
      reportData.inscriptions.reduce(
        (sum, item) => sum + item.countParticipants,
        0,
      ) +
      reportData.guestInscriptions.reduce(
        (sum, item) => sum + item.countParticipants,
        0,
      );

    const totalGroupValue =
      reportData.inscriptions.reduce((sum, item) => sum + item.totalValue, 0) +
      reportData.guestInscriptions.reduce(
        (sum, item) => sum + item.totalValue,
        0,
      );

    const expensesTotals = reportData.expenses;

    return {
      event: {
        name: reportData.name,
        startDate: reportData.startDate,
        endDate: reportData.endDate,
        location: undefined,
      },
      totais: {
        totalInscricoesGrupo: reportData.typeInscriptions.length,
        totalParticipantesGrupo: totalGroupParticipants,
        totalInscricoesAvulsas: reportData.ticketSale.byTicket.length,
        totalParticipantesAvulsos:
          reportData.inscriptionAvuls.countParticipants,
        totalParticipantes: reportData.countParticipants,
        totalGeral: reportData.totalValue + expensesTotals.total,
        totalArrecadado: reportData.totalValue,
        totalDinheiro: methodValue(PaymentMethod.DINHEIRO),
        totalPix: methodValue(PaymentMethod.PIX),
        totalCartao: methodValue(PaymentMethod.CARTAO),
        totalGastos: expensesTotals.total,
      },
      inscricoes: {
        total: totalGroupValue,
        totalDinheiro: groupByMethod(PaymentMethod.DINHEIRO),
        totalPix: groupByMethod(PaymentMethod.PIX),
        totalCartao: groupByMethod(PaymentMethod.CARTAO),
        totalParticipantes: totalGroupParticipants,
        inscricoes: typeInscriptionDetails,
      },
      inscricoesAvulsas: {
        total: reportData.inscriptionAvuls.totalValue,
        totalDinheiro: getMethodValue(
          PaymentMethod.DINHEIRO,
          reportData.inscriptionAvuls.byPaymentMethod,
        ),
        totalPix: getMethodValue(
          PaymentMethod.PIX,
          reportData.inscriptionAvuls.byPaymentMethod,
        ),
        totalCartao: getMethodValue(
          PaymentMethod.CARTAO,
          reportData.inscriptionAvuls.byPaymentMethod,
        ),
        totalParticipantes: reportData.inscriptionAvuls.countParticipants,
        inscricoes: avulsDetails,
      },
      tickets: {
        total: reportData.ticketSale.totalSales,
        totalDinheiro: getMethodValue(
          PaymentMethod.DINHEIRO,
          reportData.ticketSale.byPaymentMethod,
        ),
        totalPix: getMethodValue(
          PaymentMethod.PIX,
          reportData.ticketSale.byPaymentMethod,
        ),
        totalCartao: getMethodValue(
          PaymentMethod.CARTAO,
          reportData.ticketSale.byPaymentMethod,
        ),
        vendas: ticketSales,
      },
      gastos: {
        total: expensesTotals.total,
        totalDinheiro: expensesTotals.totalDinheiro,
        totalPix: expensesTotals.totalPix,
        totalCartao: expensesTotals.totalCartao,
        gastos: expensesTotals.gastos.map((expense) => ({
          description: expense.description,
          paymentMethod: expense.paymentMethod,
          responsible: expense.responsible,
          value: expense.value,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
        })),
      },
    };
  }
}
