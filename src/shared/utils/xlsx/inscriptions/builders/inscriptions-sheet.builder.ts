import * as ExcelJS from 'exceljs';
import { formatDateTime, formatInscriptionStatus } from '../formatters';
import { ListInscriptionsXlsxData } from '../list-inscriptions-xlsx-generator.util';

export class InscriptionsSheetBuilder {
  static build(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
    paymentLineMap: Map<string, number>,
    participantLineMap: Map<string, number>,
  ) {
    const ws = workbook.addWorksheet('Inscrições');

    ws.columns = [
      { header: 'ID', key: 'id', width: 18 },
      { header: 'Responsável', key: 'responsible', width: 30 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Localidade', key: 'locality', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Convidado?', key: 'isGuest', width: 12 },
      { header: 'Criado em', key: 'createdAt', width: 20 },
      { header: 'Qtd. participantes', key: 'participantsCount', width: 16 },
      { header: 'Qtd. pagamentos', key: 'paymentsCount', width: 14 },
      {
        header: 'Visualizar Participantes',
        key: 'viewParticipants',
        width: 22,
      },
      { header: 'Visualizar Pagamentos', key: 'viewPayments', width: 20 },
    ];

    ws.addRow(ws.columns.map((c) => c.header));

    for (const inscription of data.inscriptions) {
      const row = ws.addRow([
        inscription.id,
        inscription.responsible,
        inscription.email ?? '',
        inscription.phone ?? '',
        inscription.locality ?? '',
        formatInscriptionStatus(inscription.status),
        inscription.isGuest ? 'Sim' : 'Não',
        formatDateTime(inscription.createdAt),
        inscription.participants?.length ?? 0,
        inscription.payments?.length ?? 0,
        '', // Placeholder para botão de participantes
        '', // Placeholder para botão de pagamentos
      ]);

      // Botão visual para visualizar participantes
      if (participantLineMap.has(inscription.id)) {
        const participantRow = participantLineMap.get(inscription.id)!;
        const cell = row.getCell(11); // Coluna "Visualizar Participantes"
        cell.value = {
          text: '👁️ Ver Participantes',
          hyperlink: `#Participantes!A${participantRow}`,
        };
        this.applyButtonStyle(cell);
      }

      // Botão visual para visualizar pagamentos
      if (paymentLineMap.has(inscription.id)) {
        const paymentRow = paymentLineMap.get(inscription.id)!;
        const cell = row.getCell(12); // Coluna "Visualizar Pagamentos"
        cell.value = {
          text: '💳 Ver Pagamentos',
          hyperlink: `#Pagamentos!A${paymentRow}`,
        };
        this.applyButtonStyle(cell);
      }
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
