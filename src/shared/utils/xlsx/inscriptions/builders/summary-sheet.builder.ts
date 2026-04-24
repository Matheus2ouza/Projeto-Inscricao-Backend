import * as ExcelJS from 'exceljs';
import { formatInscriptionStatus, formatPaymentMethod } from '../formatters';
import { ListInscriptionsXlsxData } from '../list-inscriptions-xlsx-generator.util';

const COLORS = {
  primaryDark: 'FF1F3864',
  primaryMid: 'FF2E4057',
  primaryLight: 'FFD6E4F0',
  white: 'FFFFFFFF',
  rowAlt: 'FFF7F9FC',
  textGray: 'FF6B7280',
  border: 'FFD1D5DB',
};

export class SummarySheetBuilder {
  static build(workbook: ExcelJS.Workbook, data: ListInscriptionsXlsxData) {
    const ws = workbook.addWorksheet('Sumário');
    ws.columns = [
      { width: 28 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
      { width: 22 },
    ];

    // ── Título principal
    this.addTitle(ws, data.header.title);
    if (data.header.titleDetail) this.addSubtitle(ws, data.header.titleDetail);
    if (data.header.subtitle) this.addSubtitle(ws, data.header.subtitle);
    this.addSpacer(ws);

    // ── Totais gerais
    this.addSectionHeader(ws, 'Resumo Geral');
    this.addKv(ws, 'Inscrições encontradas', data.inscriptions.length, true);
    if (data.totals) {
      this.addKv(
        ws,
        'Total inscrições (contagem)',
        data.totals.totalInscriptions ?? 0,
      );
      this.addKv(
        ws,
        'Participantes (conta)',
        data.totals.totalAccountParticipants,
      );
      this.addKv(
        ws,
        'Participantes (convidados)',
        data.totals.totalGuestParticipants,
      );
    }
    this.addSpacer(ws);

    // ── Por status
    const statusCounts = new Map<string, number>();
    const methodCounts = new Map<string, number>();

    for (const inscription of data.inscriptions) {
      const statusKey = formatInscriptionStatus(inscription.status);
      statusCounts.set(statusKey, (statusCounts.get(statusKey) ?? 0) + 1);

      if (inscription.payments?.length) {
        for (const payment of inscription.payments) {
          const methodKey = formatPaymentMethod(payment.methodPayment);
          methodCounts.set(methodKey, (methodCounts.get(methodKey) ?? 0) + 1);
        }
      } else {
        methodCounts.set(
          'Sem pagamento',
          (methodCounts.get('Sem pagamento') ?? 0) + 1,
        );
      }
    }

    this.addSectionHeader(ws, 'Por Status');
    this.addTableHeader(ws, ['Status', 'Qtd.']);
    [...statusCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .forEach(([label, count], i) => this.addTableRow(ws, [label, count], i));
    this.addSpacer(ws);

    this.addSectionHeader(ws, 'Por Método de Pagamento');
    this.addTableHeader(ws, ['Método', 'Qtd.']);
    [...methodCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .forEach(([label, count], i) => this.addTableRow(ws, [label, count], i));
    this.addSpacer(ws);

    // ── Participantes
    if (data.participantSummary) {
      this.addSectionHeader(ws, 'Participantes');
      this.addTableHeader(ws, ['Gênero', 'Qtd.']);
      this.addTableRow(ws, ['Total', data.participantSummary.total], 0);
      this.addTableRow(ws, ['Masculino', data.participantSummary.male], 1);
      this.addTableRow(ws, ['Feminino', data.participantSummary.female], 2);
      this.addSpacer(ws);
    }

    // ── Resumo de pagamentos
    if (data.paymentSummary?.byMethod?.length) {
      this.addSectionHeader(ws, 'Resumo de Pagamentos');
      this.addTableHeader(ws, [
        'Método',
        'Valor total Inscriçãos',
        'Total Pago',
        'Total Liquido',
        'Total recebido',
      ]);
      data.paymentSummary.byMethod.forEach((item, i) => {
        this.addTableRow(
          ws,
          [
            formatPaymentMethod(item.method),
            item.totalValue,
            item.totalPaid,
            item.totalNetValue,
            item.totalReceived,
          ],
          i,
        );
      });
    }
  }

  // ── Helpers de layout ──────────────────────────────────────────────────────

  private static addTitle(ws: ExcelJS.Worksheet, text: string) {
    const row = ws.addRow([text]);
    row.height = 28;
    const cell = row.getCell(1);
    cell.font = { bold: true, size: 18, color: { argb: COLORS.primaryDark } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    row.commit();
  }

  private static addSubtitle(ws: ExcelJS.Worksheet, text: string) {
    const row = ws.addRow([text]);
    row.height = 18;
    const cell = row.getCell(1);
    cell.font = { size: 11, italic: true, color: { argb: COLORS.textGray } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    row.commit();
  }

  private static addSpacer(ws: ExcelJS.Worksheet) {
    const row = ws.addRow([]);
    row.height = 8;
    row.commit();
  }

  private static addSectionHeader(ws: ExcelJS.Worksheet, label: string) {
    const row = ws.addRow([label]);
    row.height = 22;
    const cell = row.getCell(1);
    cell.font = { bold: true, size: 12, color: { argb: COLORS.primaryDark } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.primaryLight },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    cell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } };

    // Estende o fundo para a coluna 2 também
    const cell2 = row.getCell(2);
    cell2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.primaryLight },
    };
    cell2.border = {
      bottom: { style: 'thin', color: { argb: COLORS.border } },
    };

    row.commit();
  }

  private static addTableHeader(ws: ExcelJS.Worksheet, labels: string[]) {
    const row = ws.addRow(labels);
    row.height = 20;
    labels.forEach((_, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.font = { bold: true, size: 11, color: { argb: COLORS.white } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.primaryMid },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIndex === 0 ? 'left' : 'center',
        indent: colIndex === 0 ? 1 : 0,
      };
      cell.border = {
        bottom: { style: 'thin', color: { argb: COLORS.border } },
        top: { style: 'thin', color: { argb: COLORS.border } },
      };
    });
    row.commit();
  }

  private static addTableRow(
    ws: ExcelJS.Worksheet,
    values: (string | number)[],
    rowIndex: number,
  ) {
    const isAlt = rowIndex % 2 === 1;
    const bgColor = isAlt ? COLORS.rowAlt : COLORS.white;

    const row = ws.addRow(values);
    row.height = 17;
    values.forEach((_, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      cell.font = { size: 11, bold: colIndex === 1 && rowIndex === 0 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colIndex === 0 ? 'left' : 'right',
        indent: colIndex === 0 ? 1 : 0,
      };
      cell.border = {
        bottom: { style: 'hair', color: { argb: COLORS.border } },
      };

      // Formatação numérica
      if (typeof values[colIndex] === 'number' && colIndex > 0) {
        cell.numFmt = values[colIndex] % 1 !== 0 ? '#,##0.00' : '#,##0';
      }
    });
    row.commit();
  }

  private static addKv(
    ws: ExcelJS.Worksheet,
    label: string,
    value: number,
    highlight = false,
  ) {
    const row = ws.addRow([label, value]);
    row.height = 18;

    const labelCell = row.getCell(1);
    labelCell.font = {
      size: 11,
      bold: highlight,
      color: { argb: highlight ? COLORS.primaryDark : 'FF111827' },
    };
    labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    const valueCell = row.getCell(2);
    valueCell.font = {
      size: 11,
      bold: true,
      color: { argb: highlight ? COLORS.primaryDark : 'FF111827' },
    };
    valueCell.alignment = { vertical: 'middle', horizontal: 'right' };
    valueCell.numFmt = '#,##0';

    row.commit();
  }
}
