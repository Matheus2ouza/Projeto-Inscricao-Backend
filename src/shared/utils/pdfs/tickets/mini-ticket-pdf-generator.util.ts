import bwipjs from 'bwip-js';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';

const MM_TO_POINTS = 2.83465;
const PAPER_WIDTH = 58 * MM_TO_POINTS;
const MARGIN = 8;
const HEADER_HEIGHT = 0;
const QR_SIZE = 36 * MM_TO_POINTS;
const TEXT_BLOCK_HEIGHT = 40;
const BOTTOM_SPACING = 10;
const SEPARATOR_HEIGHT = 14;

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

      const qrImage = await MiniTicketPdfGenerator.buildBarcodeImage(
        pdfDoc,
        ticket.ticketId,
      );

      const titleSize = 12;
      const ticketTitle = ticket.ticketName.toUpperCase();
      const textWidth = bold.widthOfTextAtSize(ticketTitle, titleSize);
      page.drawText(ticketTitle, {
        x: (PAPER_WIDTH - textWidth) / 2,
        y: baseY - 16,
        size: titleSize,
        font: bold,
        color: rgb(0, 0, 0),
      });

      const qrY = baseY - 16 - QR_SIZE - 14;
      page.drawImage(qrImage, {
        x: (PAPER_WIDTH - QR_SIZE) / 2,
        y: qrY,
        width: QR_SIZE,
        height: QR_SIZE,
      });

      const infoY = qrY - 24;
      const dateText = `${dateLabel}   ${timeLabel}`;
      const infoWidth = font.widthOfTextAtSize(dateText, 9);
      page.drawText(dateText, {
        x: (PAPER_WIDTH - infoWidth) / 2,
        y: infoY,
        size: 9,
        font,
        color: rgb(0, 0, 0),
      });

      if (index < ticketCount - 1) {
        const separatorY =
          baseY - (MiniTicketPdfGenerator.ticketHeight + SEPARATOR_HEIGHT / 2);
        this.drawDashedSeparator(page, separatorY);
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
  ) {}

  private static async buildBarcodeImage(pdfDoc: PDFDocument, value: string) {
    const pngBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: value,
      scale: 2,
      height: 10,
      includetext: false,
      paddingwidth: 0,
      paddingheight: 0,
    });
    return pdfDoc.embedPng(pngBuffer);
  }

  private static formatDateLabels(date: Date) {
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
    const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
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
