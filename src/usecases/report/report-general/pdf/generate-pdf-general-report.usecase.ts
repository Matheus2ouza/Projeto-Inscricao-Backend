import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { ReportGeneralPdfGeneratorUtils } from 'src/shared/utils/pdfs/report-general-pdf-generator.util';
import { ReportGeneralUsecase } from '../general/report-general.usecase';

export type GeneratePdfGeneralReportInput = {
  eventId: string;
};

export type GeneratePdfGeneralReportOutput = {
  pdfBuffer: Buffer;
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
    // Buscar dados do relatório
    const relatorioData = await this.reportGeneralUsecase.execute({ eventId });
    const eventImageDataUrl = await this.carregarImagemEvento(
      relatorioData.event.imageUrl,
    );

    // Gerar PDF usando pdfmake
    const pdfBuffer = await ReportGeneralPdfGeneratorUtils.gerarRelatorioPdf(
      relatorioData,
      {
        eventImageDataUrl,
      },
    );
    const filename = `relatorio-${relatorioData.event.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      pdfBuffer,
      filename,
    };
  }

  private async carregarImagemEvento(
    imagePath?: string | null,
  ): Promise<string | undefined> {
    if (!imagePath) {
      return undefined;
    }

    try {
      const signedUrl =
        await this.supabaseStorageService.getPublicUrl(imagePath);
      const response = await fetch(signedUrl);

      if (!response.ok) {
        console.warn(
          `Falha ao carregar imagem do evento: ${response.status} ${response.statusText}`,
        );
        return undefined;
      }

      const arrayBuffer = await response.arrayBuffer();
      const mimeType = response.headers.get('content-type') ?? 'image/jpeg';
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn('Erro ao obter imagem do evento:', error);
      return undefined;
    }
  }
}
