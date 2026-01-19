import path from 'path';
import PdfPrinter from 'pdfmake';
import type {
  PageSize,
  TableLayout,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';

const fontsPath = path.join(process.cwd(), 'public', 'fonts');

const fonts = {
  OpenSans: {
    normal: path.join(fontsPath, 'OpenSans', 'normal', 'OpenSans-Regular.ttf'),
    bold: path.join(fontsPath, 'OpenSans', 'normal', 'OpenSans-Bold.ttf'),
    italics: path.join(fontsPath, 'OpenSans', 'Italic', 'OpenSans-Italic.ttf'),
    bolditalics: path.join(
      fontsPath,
      'OpenSans',
      'Italic',
      'OpenSans-SemiBoldItalic.ttf',
    ),
  },
};

const printer = new PdfPrinter(fonts);

const mmToPt = (millimeters: number) => (millimeters * 72) / 25.4;

const LABEL_WIDTH_MM = 101.6;
const LABEL_HEIGHT_MM = 25.4;
const LABEL_COLUMNS = 2;
const LABEL_ROWS = 10;
const LABELS_PER_PAGE = LABEL_COLUMNS * LABEL_ROWS;

const LETTER_MARGINS_MM = {
  top: 12.7,
  bottom: 12.7,
  left: 4,
  right: 4,
};

const LABEL_COLUMN_SPACING_EXTRA_MM = 3;
const LABEL_COLUMN_SPACING_EXTRA_PT = mmToPt(LABEL_COLUMN_SPACING_EXTRA_MM);
const LABEL_CELL_HORIZONTAL_PADDING_MM = 5;
const LABEL_CELL_HORIZONTAL_PADDING_PT = mmToPt(
  LABEL_CELL_HORIZONTAL_PADDING_MM,
);
const LABEL_CELL_VERTICAL_PADDING_MM = 5;
const LABEL_CELL_VERTICAL_PADDING_PT = mmToPt(LABEL_CELL_VERTICAL_PADDING_MM);

const tableLayout: TableLayout = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

export type ParticipantEtiquetaEntry = {
  participantName: string;
};

export class EtiquetaPdfGenerator {
  public static async generateLabelSheetPdf(
    entries: ParticipantEtiquetaEntry[],
  ): Promise<Buffer> {
    const content: any[] = [];

    const pagesCount = Math.max(1, Math.ceil(entries.length / LABELS_PER_PAGE));

    for (let pageIndex = 0; pageIndex < pagesCount; pageIndex += 1) {
      const pageStart = pageIndex * LABELS_PER_PAGE;
      const pageEntries = Array.from(
        { length: LABELS_PER_PAGE },
        (_, index) => {
          return entries[pageStart + index];
        },
      );

      const body = this.buildTableBody(pageEntries);

      const tableDefinition: any = {
        table: {
          widths: Array(LABEL_COLUMNS).fill(mmToPt(LABEL_WIDTH_MM)),
          heights: Array(LABEL_ROWS).fill(mmToPt(LABEL_HEIGHT_MM)),
          body,
        },
        layout: tableLayout,
      };

      if (pageIndex < pagesCount - 1) {
        tableDefinition.pageBreak = 'after';
      }

      content.push(tableDefinition);
    }

    const pageMargins: [number, number, number, number] = [
      mmToPt(LETTER_MARGINS_MM.left),
      mmToPt(LETTER_MARGINS_MM.top),
      mmToPt(LETTER_MARGINS_MM.right),
      mmToPt(LETTER_MARGINS_MM.bottom),
    ];

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER' as PageSize,
      pageMargins,
      defaultStyle: {
        font: 'OpenSans',
        color: '#1e1e1e',
      },
      content,
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private static buildTableBody(
    entries: (ParticipantEtiquetaEntry | undefined)[],
  ) {
    const rows: any[][] = [];

    for (let rowIndex = 0; rowIndex < LABEL_ROWS; rowIndex += 1) {
      const cells: any[] = [];

      for (let columnIndex = 0; columnIndex < LABEL_COLUMNS; columnIndex += 1) {
        const entryIndex = rowIndex * LABEL_COLUMNS + columnIndex;
        const entry = entries[entryIndex];

        cells.push(
          entry
            ? this.buildLabelCell(entry, columnIndex)
            : this.buildEmptyCell(columnIndex),
        );
      }

      rows.push(cells);
    }

    return rows;
  }

  private static buildEmptyCell(columnIndex: number) {
    const [leftMargin, rightMargin] =
      this.getCellHorizontalMargins(columnIndex);

    return {
      text: '',
      margin: [
        leftMargin,
        LABEL_CELL_VERTICAL_PADDING_PT,
        rightMargin,
        LABEL_CELL_VERTICAL_PADDING_PT,
      ],
      alignment: 'center',
    };
  }

  private static buildLabelCell(
    entry: ParticipantEtiquetaEntry,
    columnIndex: number,
  ) {
    const [leftMargin, rightMargin] =
      this.getCellHorizontalMargins(columnIndex);
    const displayName = entry.participantName;

    return {
      stack: [
        {
          text: displayName,
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 2],
          lineHeight: 1.1,
        },
      ],
      margin: [
        leftMargin,
        LABEL_CELL_VERTICAL_PADDING_PT,
        rightMargin,
        LABEL_CELL_VERTICAL_PADDING_PT,
      ],
      alignment: 'center',
    };
  }

  private static getCellHorizontalMargins(columnIndex: number) {
    const extraLeft = columnIndex === 1 ? LABEL_COLUMN_SPACING_EXTRA_PT : 0;
    const extraRight = columnIndex === 0 ? LABEL_COLUMN_SPACING_EXTRA_PT : 0;

    const left = LABEL_CELL_HORIZONTAL_PADDING_PT + extraLeft;
    const right = LABEL_CELL_HORIZONTAL_PADDING_PT + extraRight;

    return [left, right];
  }
}
