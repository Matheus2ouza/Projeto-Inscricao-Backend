import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { ReportGeneralPdfGeneratorUtils } from 'src/shared/utils/pdfs/report-general-pdf-generator.util';
import { ReportGeneralUsecase } from '../general/report-general.usecase';

export type GeneratePdfGeneralReportInput = {
  eventId: string;
};

export type GeneratePdfGeneralReportOutput = {
  pdfBase64: string; // 👈 alterado de Buffer para string Base64
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
    const reportData = await this.reportGeneralUsecase.execute({ eventId });
    const eventImageDataUrl = await this.loadEventImage(
      reportData.event.imageUrl,
    );

    // Generate PDF using pdfmake
    const pdfBuffer = await ReportGeneralPdfGeneratorUtils.generateReportPdf(
      reportData,
      { eventImageDataUrl },
    );

    const filename = `report-${reportData.event.name
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
}
