import * as XLSX from 'xlsx';
import { ExcelDateUtil } from '../utils/excel-date.util';
import { GenderConverterUtil } from '../utils/gender-converter.util';

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
      const birthDateRaw = row[2];
      const genderRaw = String(row[3] ?? '').trim();
      const typeDescription = String(row[4] ?? '').trim();

      if (!name && !birthDateRaw && !genderRaw && !typeDescription) continue;

      // Converter data do Excel para DD/MM/AAAA
      let birthDateStr = '';
      if (birthDateRaw) {
        if (typeof birthDateRaw === 'number') {
          birthDateStr = ExcelDateUtil.convertExcelSerialToDate(birthDateRaw);
        } else {
          birthDateStr = String(birthDateRaw).trim();
        }
      }

      // Converter gênero para formato completo
      let gender = '';
      if (genderRaw) {
        try {
          gender = GenderConverterUtil.convertToFullGender(genderRaw);
        } catch (error) {
          // Se não conseguir converter, mantém o valor original para validação posterior
          gender = genderRaw;
        }
      }

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
