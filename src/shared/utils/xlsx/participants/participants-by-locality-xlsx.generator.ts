import * as ExcelJS from 'exceljs';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type ParticipantLocalityXlsxRow = {
  index: number;
  name: string;
  preferredName?: string;
  locality: string;
  age: number;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender?: genderType;
};

export type ParticipantLocalityXlsxData = {
  eventName: string;
  participants: ParticipantLocalityXlsxRow[];
};

export class ParticipantsByLocalityXlsxGenerator {
  public static async generateReportXlsx(
    data: ParticipantLocalityXlsxData,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Projeto-Inscricao-Backend';
    workbook.created = new Date();

    this.buildParticipantsByLocalitySheet(workbook, data);

    const arrayBuffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
    return Buffer.from(arrayBuffer);
  }

  private static buildParticipantsByLocalitySheet(
    workbook: ExcelJS.Workbook,
    data: ParticipantLocalityXlsxData,
  ) {
    const ws = workbook.addWorksheet('Participantes por Localidade');

    // Título do relatório
    ws.addRow([`Lista de Participantes: ${data.eventName}`]);
    ws.addRow([`${data.participants.length} participante(s)`]);
    ws.addRow([`Gerado em ${formatDateTime(new Date())}`]);
    ws.addRow([]);

    // Configurar colunas
    ws.columns = [
      { header: 'Localidade', key: 'locality', width: 25 },
      { header: '#', key: 'index', width: 8 },
      { header: 'Nome', key: 'name', width: 35 },
      { header: 'Como ser chamado', key: 'preferredName', width: 25 },
      { header: 'Idade', key: 'age', width: 8 },
      { header: 'Gênero', key: 'gender', width: 15 },
      { header: 'Tamanho', key: 'shirtSize', width: 12 },
      { header: 'Tipo', key: 'shirtType', width: 15 },
    ];

    // Adicionar cabeçalho da tabela
    ws.addRow(ws.columns.map((c) => c.header));

    // Agrupar participantes por localidade
    const groups = new Map<string, ParticipantLocalityXlsxRow[]>();
    for (const participant of data.participants) {
      const locality = participant.locality || '-';
      const list = groups.get(locality) ?? [];
      list.push(participant);
      groups.set(locality, list);
    }

    // Ordenar localidades
    const sortedLocalities = [...groups.keys()].sort((a, b) => {
      if (a === '-' && b !== '-') return 1;
      if (a !== '-' && b === '-') return -1;
      return a.localeCompare(b, 'pt-BR');
    });

    // Adicionar dados
    for (const locality of sortedLocalities) {
      const participants = groups.get(locality) ?? [];
      const sortedParticipants = participants.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR'),
      );

      for (const participant of sortedParticipants) {
        ws.addRow([
          locality === '-' ? 'Não informada' : locality,
          participant.index,
          participant.name,
          participant.preferredName || '-',
          participant.age,
          formatGender(participant.gender),
          participant.shirtSize || '-',
          participant.shirtType || '-',
        ]);
      }

      // Adicionar linha de total por localidade
      if (participants.length > 0) {
        const totalRow = ws.addRow([
          `Total ${locality === '-' ? 'Não informada' : locality}`,
          '',
          '',
          '',
          '',
          '',
          '',
          `${participants.length} participante(s)`,
        ]);

        // Estilizar linha de total
        totalRow.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' },
          };
        });

        // Adicionar linha em branco entre localidades
        if (locality !== sortedLocalities[sortedLocalities.length - 1]) {
          ws.addRow([]);
        }
      }
    }

    // Aplicar estilos no cabeçalho da tabela
    this.applyTableHeaderStyle(ws, 4); // Cabeçalho está na linha 4 (após título e linha em branco)

    // Estilizar linhas de título
    this.applyTitleStyles(ws, 1, 3);

    // Auto filtro
    ws.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: ws.columns.length },
    };

    // Congelar linhas (título + cabeçalho)
    ws.views = [{ state: 'frozen', ySplit: 4 }];

    // Ajustar largura das colunas
    this.autoFitColumns(ws);
  }

  private static applyTableHeaderStyle(
    ws: ExcelJS.Worksheet,
    headerRow: number,
  ) {
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

  private static applyTitleStyles(
    ws: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
  ) {
    for (let r = startRow; r <= endRow; r++) {
      const row = ws.getRow(r);
      row.font = {
        bold: r === startRow,
        size: r === startRow ? 14 : 11,
        color: r === startRow ? { argb: 'FF1A365D' } : { argb: 'FF2D3748' },
      };
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.commit();
    }
  }

  private static autoFitColumns(ws: ExcelJS.Worksheet) {
    ws.columns?.forEach((col) => {
      if (!col) return;
      if (typeof (col as any).eachCell !== 'function') return;
      let max = 10;
      (col as any).eachCell({ includeEmpty: true }, (cell: any) => {
        const v = cell.value;
        const len = String(v ?? '').length;
        if (len > max) max = len;
      });
      col.width = Math.min(Math.max(max + 2, 10), 60);
    });
  }
}

// Funções auxiliares de formatação
function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

function formatGender(gender?: genderType | null): string {
  if (!gender) return 'Não informado';
  switch (gender) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender).charAt(0) + String(gender).slice(1).toLowerCase();
  }
}
