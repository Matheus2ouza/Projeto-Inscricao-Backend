import * as ExcelJS from 'exceljs';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type ReportColumn =
  | 'name'
  | 'preferredName'
  | 'cpf'
  | 'birthDate'
  | 'gender'
  | 'shirtSize'
  | 'shirtType'
  | 'typeInscription';

export type ReportSummary = {
  totalParticipants: number;
  genderCount: Record<string, number>;
  shirtSizeCount: Record<string, number>;
};

export type ParticipantLocalityXlsxRow = {
  index: number;
  name?: string;
  preferredName?: string;
  locality: string;
  age?: number;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender?: genderType;
};

export type ParticipantLocalityXlsxData = {
  eventName: string;
  participants: ParticipantLocalityXlsxRow[];
  summary?: ReportSummary;
  columns?: ReportColumn[];
};

export class ParticipantsByLocalityXlsxGenerator {
  public static async generateReportXlsx(
    data: ParticipantLocalityXlsxData,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Projeto-Inscricao-Backend';
    workbook.created = new Date();

    this.buildParticipantsByLocalitySheet(workbook, data);

    // Se houver resumo, adicionar uma aba com o resumo
    if (data.summary) {
      this.buildSummarySheet(workbook, data.summary);
    }

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

    // Determinar colunas visíveis
    const shouldShow = (col: ReportColumn) =>
      !data.columns || data.columns.includes(col);
    const shouldShowAge = shouldShow('birthDate');

    // Configurar colunas dinamicamente
    const columns: any[] = [];

    columns.push({ header: 'Localidade', key: 'locality', width: 25 });
    columns.push({ header: '#', key: 'index', width: 8 });

    if (shouldShow('name')) {
      columns.push({ header: 'Nome', key: 'name', width: 35 });
    }
    if (shouldShow('preferredName')) {
      columns.push({
        header: 'Como ser chamado',
        key: 'preferredName',
        width: 25,
      });
    }

    if (shouldShowAge) {
      columns.push({ header: 'Idade', key: 'age', width: 8 });
    }

    if (shouldShow('gender')) {
      columns.push({ header: 'Gênero', key: 'gender', width: 15 });
    }
    if (shouldShow('shirtSize')) {
      columns.push({ header: 'Tamanho', key: 'shirtSize', width: 12 });
    }
    if (shouldShow('shirtType')) {
      columns.push({ header: 'Tipo', key: 'shirtType', width: 15 });
    }

    ws.columns = columns;

    // Adicionar cabeçalho da tabela
    ws.addRow(columns.map((c) => c.header));

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
        (a.name || '').localeCompare(b.name || '', 'pt-BR'),
      );

      for (const participant of sortedParticipants) {
        const row: any = {
          locality: locality === '-' ? 'Não informada' : locality,
          index: participant.index,
        };

        if (shouldShow('name')) {
          row.name = participant.name || '-';
        }
        if (shouldShow('preferredName')) {
          row.preferredName = participant.preferredName || '-';
        }
        if (shouldShowAge) {
          row.age = participant.age ?? '-';
        }
        if (shouldShow('gender')) {
          row.gender = formatGender(participant.gender);
        }
        if (shouldShow('shirtSize')) {
          row.shirtSize = participant.shirtSize || '-';
        }
        if (shouldShow('shirtType')) {
          row.shirtType = participant.shirtType || '-';
        }

        ws.addRow(row);
      }

      // Adicionar linha de total por localidade
      if (participants.length > 0) {
        const totalRowData: any = {
          locality: `Total ${locality === '-' ? 'Não informada' : locality}`,
        };
        // Preencher o restante das colunas para que o total apareça na última
        const emptyCount = columns.length - 2; // -2 para localidade e "Total"
        for (let i = 0; i < emptyCount; i++) {
          totalRowData[columns[i + 2]?.key || `col_${i}`] = '';
        }
        const lastColumn = columns[columns.length - 1]?.key;
        if (lastColumn) {
          totalRowData[lastColumn] = `${participants.length} participante(s)`;
        }

        const totalRow = ws.addRow(totalRowData);

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

  private static buildSummarySheet(
    workbook: ExcelJS.Workbook,
    summary: ReportSummary,
  ) {
    const ws = workbook.addWorksheet('Resumo');

    ws.addRow(['RESUMO']);
    ws.addRow([]);

    // Total de participantes
    ws.addRow(['Total de Participantes:']);
    ws.addRow([summary.totalParticipants]);
    ws.addRow([]);

    // Por gênero
    ws.addRow(['Por Gênero:']);
    for (const [gender, count] of Object.entries(summary.genderCount)) {
      ws.addRow([gender, count]);
    }
    ws.addRow([]);

    // Por tamanho de camisa
    ws.addRow(['Por Tamanho de Camisa:']);
    for (const [size, count] of Object.entries(summary.shirtSizeCount)) {
      ws.addRow([size, count]);
    }

    // Estilizar
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
