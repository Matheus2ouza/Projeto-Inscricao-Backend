import * as XLSX from 'xlsx';

export type ParsedRow = {
  line: number;
  name: string;
  birthDateStr: string;
  typeDescription: string;
};

export class XlsxGroupParserUtil {
  static parse(buffer: Buffer): ParsedRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const parsed: ParsedRow[] = [];
    // Começa da linha 5 (índice 4)
    for (let i = 4; i < rows.length; i++) {
      const row = rows[i] as (string | number | Date | null | undefined)[];
      if (!row || row.length === 0) continue;
      const name = String(row[0] ?? '').trim();
      const birthDateStr = String(row[1] ?? '').trim();
      const typeDescription = String(row[2] ?? '').trim();

      if (!name && !birthDateStr && !typeDescription) continue;

      parsed.push({
        line: i + 1, // humano lê a partir de 1
        name,
        birthDateStr,
        typeDescription,
      });
    }

    return parsed;
  }
}
