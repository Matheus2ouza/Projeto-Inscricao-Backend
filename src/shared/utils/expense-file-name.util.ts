import { sanitizeFileName } from './file-name.util';

export function generateExpenseSlug(description: string, maxWords = 6): string {
  const safeWordSize = Math.max(1, Math.min(6, Math.floor(maxWords || 6)));

  const stopWords = [
    'da',
    'das',
    'de',
    'do',
    'dos',
    'e',
    'a',
    'o',
    'para',
    'com',
  ];

  return (
    sanitizeFileName(description)
      .split('-')
      .filter((word) => word && !stopWords.includes(word))
      .slice(0, safeWordSize)
      .join('-') || 'expense'
  );
}
