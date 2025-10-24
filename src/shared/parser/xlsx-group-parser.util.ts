import { Workbook } from 'exceljs';
import { ExcelDateUtil } from 'src/shared/utils/excel-date.util';
import { GenderConverterUtil } from 'src/shared/utils/gender-converter.util';

export type ParsedRow = {
  line: number;
  index: number;
  name: string;
  birthDateStr: string;
  gender: string;
  typeDescription: string;
};

export class XlsxGroupParserUtil {
  static async parse(buffer: Buffer): Promise<ParsedRow[]> {
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) return [];

    const normalizeCellValue = (
      value: unknown,
    ): string | number | Date | null => {
      if (value === undefined || value === null) return null;

      if (typeof value === 'object') {
        const richText = (value as { richText?: Array<{ text?: string }> })
          .richText;
        if (Array.isArray(richText)) {
          return richText.map((item) => item.text ?? '').join('');
        }

        const text = (value as { text?: string }).text;
        if (typeof text === 'string') return text;

        const result = (value as { result?: unknown }).result;
        if (result !== undefined) return normalizeCellValue(result);
      }

      return value as string | number | Date;
    };

    const parsed: ParsedRow[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber <= 5) return;

      const values = row.values as unknown[];
      const indexRaw = normalizeCellValue(values[1]);
      const nameRaw = normalizeCellValue(values[2]);
      const birthDateValue = normalizeCellValue(values[3]);
      const genderRaw = String(normalizeCellValue(values[4]) ?? '').trim();
      const typeDescription = String(
        normalizeCellValue(values[5]) ?? '',
      ).trim();

      const hasData =
        String(nameRaw ?? '').trim() ||
        birthDateValue ||
        genderRaw ||
        typeDescription;
      if (!hasData) return;

      const index = Number(indexRaw ?? '');
      const name = String(nameRaw ?? '').trim();

      let birthDateStr = '';
      if (birthDateValue) {
        if (birthDateValue instanceof Date) {
          const day = birthDateValue.getDate().toString().padStart(2, '0');
          const month = (birthDateValue.getMonth() + 1)
            .toString()
            .padStart(2, '0');
          const year = birthDateValue.getFullYear();
          birthDateStr = `${day}/${month}/${year}`;
        } else if (typeof birthDateValue === 'number') {
          birthDateStr = ExcelDateUtil.convertExcelSerialToDate(birthDateValue);
        } else {
          birthDateStr = String(birthDateValue).trim();
        }
      }

      let gender = '';
      if (genderRaw) {
        try {
          gender = GenderConverterUtil.convertToFullGender(genderRaw);
        } catch {
          gender = genderRaw;
        }
      }

      parsed.push({
        line: rowNumber,
        index,
        name,
        birthDateStr,
        gender,
        typeDescription,
      });
    });

    return parsed;
  }
}
