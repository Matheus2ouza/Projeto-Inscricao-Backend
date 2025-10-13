/**
 * Gera um slug a partir do nome do evento
 * @param name - Nome do evento
 * @returns Slug gerado
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
