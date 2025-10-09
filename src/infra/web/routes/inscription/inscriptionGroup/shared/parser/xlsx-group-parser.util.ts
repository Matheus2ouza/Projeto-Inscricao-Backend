import * as XLSX from 'xlsx';

export type ParsedRow = {
  line: number;
  index: number;
  name: string;
  birthDateStr: string;
  gender: string;
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
    for (let i = 5; i < rows.length; i++) {
      const row = rows[i] as (string | number | Date | null | undefined)[];
      if (!row || row.length === 0) continue;
      const index = Number(row[0] ?? '');
      const name = String(row[1] ?? '').trim();
      const birthDateStr = String(row[2] ?? '').trim();
      const gender = String(row[3] ?? '').trim();
      const typeDescription = String(row[4] ?? '').trim();

      if (!name && !birthDateStr && !gender && !typeDescription) continue;

      parsed.push({
        line: i + 1, // lê a partir de 1
        index,
        name,
        birthDateStr,
        gender,
        typeDescription,
      });
    }

    return parsed;
  }
}
