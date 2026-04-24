import * as ExcelJS from 'exceljs';
import {
  formatDateTime,
  formatPaymentMethod,
  formatPaymentStatus,
} from '../formatters';
import { ListInscriptionsXlsxData } from '../list-inscriptions-xlsx-generator.util';

export class PaymentsSheetBuilder {
  static build(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
    inscriptionLineMap: Map<string, number>,
  ) {
    const hasAnyPayments = data.inscriptions.some(
      (i) => i.payments && i.payments.length > 0,
    );
    if (!hasAnyPayments) return;

    const ws = workbook.addWorksheet('Pagamentos');
    ws.columns = [
      { header: 'Inscrição ID', key: 'inscriptionId', width: 18 },
      { header: 'Pagamento #', key: 'paymentIndex', width: 10 },
      { header: 'Nome (pagamento)', key: 'guestName', width: 28 },
      { header: 'Método', key: 'method', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Total pago', key: 'totalPaid', width: 14 },
      { header: 'Total recebido', key: 'totalReceived', width: 14 },
      { header: 'Criado em', key: 'createdAt', width: 20 },
      { header: 'Dir. comprovante', key: 'receiptPath', width: 30 },
      { header: 'Parcela', key: 'installmentNumber', width: 10 },
      { header: 'Recebido?', key: 'received', width: 10 },
      { header: 'Valor', key: 'value', width: 12 },
      { header: 'Valor líquido', key: 'netValue', width: 12 },
      { header: 'Pago em', key: 'paidAt', width: 20 },
      { header: 'Voltar para Inscrição', key: 'backToInscription', width: 20 },
    ];

    ws.addRow(ws.columns.map((c) => c.header));

    for (const inscription of data.inscriptions) {
      (inscription.payments ?? []).forEach((payment, paymentIdx) => {
        const installments = payment.installments?.length
          ? payment.installments
          : [undefined];

        for (const inst of installments) {
          const row = ws.addRow([
            inscription.id,
            paymentIdx + 1,
            payment.guestName ?? '',
            formatPaymentMethod(payment.methodPayment),
            formatPaymentStatus(payment.status),
            payment.totalPaid,
            payment.totalReceived,
            formatDateTime(payment.createdAt),
            payment.receiptPath ?? '',
            inst?.installmentNumber ?? '',
            inst ? (inst.received ? 'Sim' : 'Não') : '',
            inst?.value ?? '',
            inst?.netValue ?? '',
            inst?.paidAt ? formatDateTime(inst.paidAt) : '',
            '', // Placeholder para botão de voltar
          ]);

          // Botão visual para voltar para a inscrição
          if (inscriptionLineMap.has(inscription.id)) {
            const inscriptionRow = inscriptionLineMap.get(inscription.id)!;
            const cell = row.getCell(15); // Coluna "Voltar para Inscrição"
            cell.value = {
              text: '← Voltar',
              hyperlink: `#Inscrições!A${inscriptionRow}`,
            };
            this.applyButtonStyle(cell);
          }
        }
      });
    }

    this.applyTableHeaderStyle(ws, 1);
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length },
    };
  }

  private static applyTableHeaderStyle(ws: ExcelJS.Worksheet, headerRow = 1) {
    const row = ws.getRow(headerRow);
    row.font = { bold: true };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.commit();
  }

  private static applyButtonStyle(cell: ExcelJS.Cell) {
    cell.font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11,
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Azul
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF2E5C8A' } },
      left: { style: 'thin', color: { argb: 'FF2E5C8A' } },
      bottom: { style: 'thin', color: { argb: 'FF2E5C8A' } },
      right: { style: 'thin', color: { argb: 'FF2E5C8A' } },
    };
  }
}
