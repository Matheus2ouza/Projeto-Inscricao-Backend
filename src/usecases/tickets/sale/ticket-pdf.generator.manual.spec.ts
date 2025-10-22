import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { TicketPdfGenerator } from 'src/shared/utils/pdfs/ticket-pdf-generator.util';

const OUTPUT_FILENAME = 'ticket-pdf-preview';

describe('TicketPdfGenerator manual preview', () => {
  jest.setTimeout(20000);

  it('generates a pdf file to inspect the ticket styling', async () => {
    const quantityEnv = process.env.TICKET_PDF_TEST_QUANTITY;
    const parsedQuantity = Number.parseInt(quantityEnv ?? '1', 10);
    const quantity =
      Number.isNaN(parsedQuantity) || parsedQuantity < 1 ? 1 : parsedQuantity;

    const pdfBytes = await TicketPdfGenerator.generate({
      ticketId: 'ticket-preview',
      ticketName: 'Ingresso Preview',
      quantity,
      saleDate: new Date(),
    });

    const projectRoot = path.resolve(__dirname, '../../../..');
    const outputDir = path.join(projectRoot, 'generated');
    const outputPath = path.join(
      outputDir,
      `${OUTPUT_FILENAME}-q${quantity}.pdf`,
    );

    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, pdfBytes);

    console.info(`Ticket PDF preview saved to: ${outputPath}`);

    expect(pdfBytes.length).toBeGreaterThan(100);
  });
});
