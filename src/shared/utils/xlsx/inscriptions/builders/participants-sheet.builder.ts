import * as ExcelJS from 'exceljs';
import { formatAge, formatDate, formatGender } from '../formatters';
import { ListInscriptionsXlsxData } from '../list-inscriptions-xlsx-generator.util';

export class ParticipantsSheetBuilder {
  static build(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
    inscriptionLineMap: Map<string, number>,
  ) {
    const hasAnyParticipants = data.inscriptions.some(
      (i) => i.participants && i.participants.length > 0,
    );
    if (!hasAnyParticipants) return;

    const ws = workbook.addWorksheet('Participantes');
    ws.columns = [
      { header: 'Inscrição ID', key: 'inscriptionId', width: 18 },
      { header: 'Nome', key: 'name', width: 32 },
      { header: 'Nascimento', key: 'birthDate', width: 14 },
      { header: 'Idade', key: 'age', width: 8 },
      { header: 'Tamanho camisa', key: 'shirtSize', width: 14 },
      { header: 'Tipo camisa', key: 'shirtType', width: 14 },
      { header: 'Gênero', key: 'gender', width: 12 },
      { header: 'Voltar para Inscrição', key: 'backToInscription', width: 20 },
    ];

    ws.addRow(ws.columns.map((c) => c.header));

    for (const inscription of data.inscriptions) {
      for (const participant of inscription.participants ?? []) {
        const row = ws.addRow([
          inscription.id,
          participant.name,
          formatDate(participant.birthDate),
          formatAge(participant.birthDate),
          participant.shirtSize ?? '',
          participant.shirtType ?? '',
          formatGender(participant.gender),
          '', // Placeholder para botão de voltar
        ]);

        // Botão visual para voltar para a inscrição
        if (inscriptionLineMap.has(inscription.id)) {
          const inscriptionRow = inscriptionLineMap.get(inscription.id)!;
          const cell = row.getCell(8); // Coluna "Voltar para Inscrição"
          cell.value = {
            text: '← Voltar',
            hyperlink: `#Inscrições!A${inscriptionRow}`,
          };
          this.applyButtonStyle(cell);
        }
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
