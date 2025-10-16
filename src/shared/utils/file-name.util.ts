export function generateUniqueFileName(
  prefix: string,
  extension: string,
): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Substituir caracteres especiais por underscore
    .replace(/_+/g, '_') // Remover underscores duplicados
    .replace(/^_|_$/g, ''); // Remover underscores do início e fim
}
