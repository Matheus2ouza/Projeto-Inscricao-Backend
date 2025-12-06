import { Buffer } from 'node:buffer';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

const MM_TO_POINTS = 2.83465;
const PAPER_WIDTH = 58 * MM_TO_POINTS;
const MARGIN = 8;
const HEADER_HEIGHT = 40;
const QR_SIZE = 32 * MM_TO_POINTS;
const TEXT_BLOCK_HEIGHT = 32;
const BOTTOM_SPACING = 6;
const SEPARATOR_HEIGHT = 8;

export type MiniTicketEntry = {
  ticketId: string;
  ticketName: string;
};

export type MiniTicketPdfData = {
  saleId: string;
  buyerName: string;
  saleDate: Date;
  tickets: MiniTicketEntry[];
};

export class MiniTicketPdfGenerator {
  private static readonly ticketHeight =
    16 + QR_SIZE + TEXT_BLOCK_HEIGHT + BOTTOM_SPACING;

  public static async generate({
    saleId,
    buyerName,
    saleDate,
    tickets,
  }: MiniTicketPdfData): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const ticketCount = tickets.length;

    const pageHeight =
      MARGIN * 2 +
      HEADER_HEIGHT +
      ticketCount * MiniTicketPdfGenerator.ticketHeight +
      Math.max(0, ticketCount - 1) * SEPARATOR_HEIGHT;

    const page = pdfDoc.addPage([PAPER_WIDTH, pageHeight]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    this.drawHeader(page, font, bold, saleId, buyerName, pageHeight);
    const { dateLabel, timeLabel } =
      MiniTicketPdfGenerator.formatDateLabels(saleDate);

    const ticketsStartY = pageHeight - MARGIN - HEADER_HEIGHT;

    for (let index = 0; index < ticketCount; index += 1) {
      const baseY =
        ticketsStartY -
        index * (MiniTicketPdfGenerator.ticketHeight + SEPARATOR_HEIGHT);
      const ticket = tickets[index];

      const qrImage = await MiniTicketPdfGenerator.buildQrImage(
        pdfDoc,
        ticket.ticketId,
      );

      const titleSize = 9;
      const textWidth = bold.widthOfTextAtSize(ticket.ticketName, titleSize);
      page.drawText(ticket.ticketName, {
        x: (PAPER_WIDTH - textWidth) / 2,
        y: baseY - 16,
        size: titleSize,
        font: bold,
        color: rgb(0, 0, 0),
      });

      const qrY = baseY - 16 - QR_SIZE - 6;
      page.drawImage(qrImage, {
        x: (PAPER_WIDTH - QR_SIZE) / 2,
        y: qrY,
        width: QR_SIZE,
        height: QR_SIZE,
      });

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

      if (index < ticketCount - 1) {
        this.drawDashedSeparator(page, infoY - 8);
      }
    }

    return pdfDoc.save();
  }

  private static drawHeader(
    page: PDFPage,
    font: PDFFont,
    bold: PDFFont,
    saleId: string,
    buyerName: string,
    pageHeight: number,
  ) {
    const title = 'INGRESSOS';
    const titleSize = 12;
    const titleWidth = bold.widthOfTextAtSize(title, titleSize);

    page.drawText(title, {
      x: (PAPER_WIDTH - titleWidth) / 2,
      y: pageHeight - MARGIN - titleSize,
      size: titleSize,
      font: bold,
      color: rgb(0, 0, 0),
    });

    const saleText = {
      x: MARGIN,
      y: pageHeight - MARGIN - titleSize - 16,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    };

    page.drawText(`Venda: ${saleId}`, saleText);
    page.drawText(`Comprador: ${buyerName}`, {
      ...saleText,
      y: saleText.y - 12,
    });
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
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    });
    const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    });

    return {
      dateLabel: `Data: ${dateFormatter.format(date)}`,
      timeLabel: `Hora: ${timeFormatter.format(date)}`,
    };
  }

  private static drawDashedSeparator(page: PDFPage, y: number) {
    const dashLength = 3;
    const gapLength = 2;
    let x = MARGIN;
    const endX = PAPER_WIDTH - MARGIN;

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
