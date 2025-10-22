import QRCode from 'qrcode';
import { TicketPdfGenerator } from 'src/shared/utils/pdfs/ticket-pdf-generator.util';

jest.mock('qrcode', () => ({
  __esModule: true,
  default: {
    toDataURL: jest.fn(),
  },
}));

jest.mock('pdf-lib', () => {
  const actual = jest.requireActual('pdf-lib');
  const documentInstances: any[] = [];

  class MockPDFPage {
    public drawRectangle = jest.fn();

    public drawText = jest.fn();

    public drawImage = jest.fn();
  }

  class MockPDFDocument {
    public pages: MockPDFPage[] = [];

    public pageSizes: [number, number][] = [];

    public embeddedFonts: string[] = [];

    public embeddedImages: any[] = [];

    public addPage = jest.fn((size: [number, number]) => {
      this.pageSizes.push(size);
      const page = new MockPDFPage();
      this.pages.push(page);
      return page;
    });

    public embedFont = jest.fn(async (font: string) => {
      const fontToken = `font:${font}`;
      this.embeddedFonts.push(fontToken);
      return {
        ...fontToken,
        widthOfTextAtSize: jest.fn(
          (text: string, size: number) => text.length * size * 0.6,
        ),
      };
    });

    public embedPng = jest.fn(async (imageBytes: Uint8Array) => {
      const resource = { source: 'png', imageBytes };
      this.embeddedImages.push(resource);
      return resource;
    });

    public save = jest.fn(async () => new Uint8Array([1, 2, 3]));
  }

  return {
    __esModule: true,
    ...actual,
    PDFDocument: {
      create: jest.fn(async () => {
        const instance = new MockPDFDocument();
        documentInstances.push(instance);
        return instance as unknown as import('pdf-lib').PDFDocument;
      }),
    },
    __mock: {
      documentInstances,
    },
  };
});

describe('TicketPdfGenerator', () => {
  const mmToPoints = 2.83465;

  beforeEach(() => {
    jest.clearAllMocks();

    const pdfLibMock: any = jest.requireMock('pdf-lib');
    pdfLibMock.__mock.documentInstances.length = 0;
  });

  it('should apply the expected styling when drawing the ticket pdf', async () => {
    (QRCode.toDataURL as jest.Mock).mockResolvedValue(
      'data:image/png;base64,ZmFrZQ==',
    );

    const pdfBytes = await TicketPdfGenerator.generate({
      ticketId: 'ticket-001',
      ticketName: 'Ingresso VIP',
      quantity: 1,
      saleDate: new Date('2024-02-20T10:12:30-03:00'),
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);

    const pdfLibMock: any = jest.requireMock('pdf-lib');
    const [document] = pdfLibMock.__mock.documentInstances;

    expect(document.addPage).toHaveBeenCalledTimes(1);

    const [pageWidth, pageHeight] = document.pageSizes[0];

    const margin = 8;
    const textAreaHeight = 30;
    const bottomSpacing = 6;
    const separatorHeight = 8;
    const paperWidth = 58 * mmToPoints;
    const qrSize = 32 * mmToPoints;
    const ticketHeight = 16 + qrSize + textAreaHeight + bottomSpacing;
    const expectedPageHeight = margin * 2 + ticketHeight;

    expect(pageWidth).toBeCloseTo(paperWidth, 3);
    expect(pageHeight).toBeCloseTo(expectedPageHeight, 3);

    const [page] = document.pages;

    // O novo gerador não usa drawRectangle, apenas drawText e drawImage
    expect(page.drawRectangle).toHaveBeenCalledTimes(0);

    const titleCall = page.drawText.mock.calls.find(
      ([text]: [string]) => text === 'Ingresso VIP',
    );
    expect(titleCall).toBeDefined();
    expect(titleCall?.[1].font).toBe('font:Helvetica-Bold');
    expect(titleCall?.[1].size).toBe(9);

    const dateCall = page.drawText.mock.calls.find(([text]: [string]) =>
      text.startsWith('Data:'),
    );
    expect(dateCall?.[1].font).toBe('font:Helvetica');
    expect(dateCall?.[1].size).toBe(7);

    const timeCall = page.drawText.mock.calls.find(([text]: [string]) =>
      text.startsWith('Hora:'),
    );
    expect(timeCall?.[1].font).toBe('font:Helvetica');
    expect(timeCall?.[1].size).toBe(7);

    expect(page.drawImage).toHaveBeenCalledTimes(1);
    const [qrImage, qrOptions] = page.drawImage.mock.calls[0];
    const embeddedQr = await document.embedPng.mock.results[0].value;

    const baseY = expectedPageHeight - margin;
    const qrY = baseY - 16 - qrSize - 6;
    const expectedQrY = qrY;
    const expectedQrX = (paperWidth - qrSize) / 2;

    expect(qrImage).toBe(embeddedQr);
    expect(qrOptions.width).toBeCloseTo(qrSize, 3);
    expect(qrOptions.height).toBeCloseTo(qrSize, 3);
    expect(qrOptions.x).toBeCloseTo(expectedQrX, 3);
    expect(qrOptions.y).toBeCloseTo(expectedQrY, 3);

    expect(QRCode.toDataURL).toHaveBeenCalledWith('ticket-001', {
      margin: 0,
      scale: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    expect(document.embedFont).toHaveBeenNthCalledWith(1, 'Helvetica');
    expect(document.embedFont).toHaveBeenNthCalledWith(2, 'Helvetica-Bold');
    expect(document.save).toHaveBeenCalledTimes(1);
  });
});
