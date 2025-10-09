export class GenderConverterUtil {
  /**
   * Converte abreviação de gênero para o formato completo do enum
   * @param genderAbbr - Abreviação do gênero (ex: "Mas", "Fem")
   * @returns Gênero completo ("MASCULINO" ou "FEMININO")
   */
  static convertToFullGender(genderAbbr: string): string {
    const normalized = genderAbbr.toLowerCase().trim();

    switch (normalized) {
      case 'mas':
      case 'masculino':
        return 'MASCULINO';
      case 'fem':
      case 'feminino':
        return 'FEMININO';
      default:
        throw new Error(`Gênero inválido: ${genderAbbr}`);
    }
  }
}
