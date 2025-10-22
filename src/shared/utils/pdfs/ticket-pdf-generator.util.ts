import { Buffer } from 'node:buffer';
import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

// Constantes para tickets (impressão 58mm)
const MM_TO_POINTS = 2.83465;
const PAPER_WIDTH = 58 * MM_TO_POINTS;

type TicketPdfData = {
  ticketId: string;
  ticketName: string;
  quantity: number;
  saleDate: Date;
};

export class TicketPdfGenerator {
  private static readonly margin = 8;
  private static readonly qrSize = 32 * MM_TO_POINTS;
  private static readonly textAreaHeight = 30;
  private static readonly bottomSpacing = 6;
  private static readonly separatorHeight = 8;

  private static readonly ticketHeight =
    16 + // título
    TicketPdfGenerator.qrSize +
    TicketPdfGenerator.textAreaHeight +
    TicketPdfGenerator.bottomSpacing;

  public static async generate({
    ticketId,
    ticketName,
    quantity,
    saleDate,
  }: TicketPdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    const pageHeight =
      TicketPdfGenerator.margin * 2 +
      quantity * TicketPdfGenerator.ticketHeight +
      (quantity - 1) * TicketPdfGenerator.separatorHeight;

    const page = pdfDoc.addPage([PAPER_WIDTH, pageHeight]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { dateLabel, timeLabel } =
      TicketPdfGenerator.formatDateLabels(saleDate);
    const qrImage = await TicketPdfGenerator.buildQrImage(pdfDoc, ticketId);

    for (let i = 0; i < quantity; i++) {
      const baseY =
        pageHeight -
        TicketPdfGenerator.margin -
        i *
          (TicketPdfGenerator.ticketHeight +
            TicketPdfGenerator.separatorHeight);

      // 1. Nome do ingresso (centralizado no topo)
      const titleSize = 9;
      const textWidth = bold.widthOfTextAtSize(ticketName, titleSize);
      page.drawText(ticketName, {
        x: (PAPER_WIDTH - textWidth) / 2,
        y: baseY - 16,
        size: titleSize,
        font: bold,
        color: rgb(0, 0, 0),
      });

      // 2. QR Code (centralizado logo abaixo do título)
      const qrY = baseY - 16 - TicketPdfGenerator.qrSize - 6;
      page.drawImage(qrImage, {
        x: (PAPER_WIDTH - TicketPdfGenerator.qrSize) / 2,
        y: qrY,
        width: TicketPdfGenerator.qrSize,
        height: TicketPdfGenerator.qrSize,
      });

      // 3. Data e hora (lado a lado abaixo do QR Code)
      const infoY = qrY - 16;
      const dateText = `${dateLabel}   ${timeLabel}`;
      const infoWidth = font.widthOfTextAtSize(dateText, 7);
      page.drawText(dateText, {
        x: (PAPER_WIDTH - infoWidth) / 2,
        y: infoY,
        size: 7,
        font,
        color: rgb(0, 0, 0),
      });

      // 4. Linha separadora pontilhada entre ingressos
      if (i < quantity - 1) {
        this.drawDashedSeparator(page, infoY - 8);
      }
    }

    return pdfDoc.save();
  }

  private static async buildQrImage(pdfDoc: PDFDocument, value: string) {
    const dataUrl = await QRCode.toDataURL(value, {
      margin: 0,
      scale: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    const base64Data = dataUrl.split(',')[1];
    const imageBytes = Buffer.from(base64Data, 'base64');
    return pdfDoc.embedPng(imageBytes);
  }

  private static formatDateLabels(date: Date) {
    const d = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    });
    const t = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    });
    return {
      dateLabel: `Data: ${d.format(date)}`,
      timeLabel: `Hora: ${t.format(date)}`,
    };
  }

  // Linha separadora pontilhada entre tickets
  private static drawDashedSeparator(page: PDFPage, y: number) {
    const dashLength = 3;
    const gapLength = 2;
    let x = TicketPdfGenerator.margin;
    const endX = PAPER_WIDTH - TicketPdfGenerator.margin;

    while (x < endX) {
      const nextX = Math.min(x + dashLength, endX);
      page.drawLine({
        start: { x, y },
        end: { x: nextX, y },
        color: rgb(0.5, 0.5, 0.5),
        thickness: 0.3,
      });
      x = nextX + gapLength;
    }
  }
}
