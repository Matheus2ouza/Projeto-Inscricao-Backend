export class ExcelDateUtil {
  /**
   * Converte número serial do Excel para data DD/MM/AAAA
   * @param excelSerial - Número serial do Excel (ex: 37126, 33946)
   * @returns Data formatada como DD/MM/AAAA
   */
  static convertExcelSerialToDate(excelSerial: number | string): string {
    const serial =
      typeof excelSerial === 'string' ? parseFloat(excelSerial) : excelSerial;

    // Excel conta dias desde 1 de janeiro de 1900
    // Mas há um bug conhecido: Excel considera 1900 como ano bissexto quando não é
    // Por isso subtraímos 2 dias para corrigir
    const excelEpoch = new Date(1900, 0, 1);
    const daysSinceEpoch = serial - 2; // -2 para corrigir o bug do Excel

    const date = new Date(
      excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000,
    );

    // Formatar como DD/MM/AAAA
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
