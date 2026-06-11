import { sanitizeFileName } from './file-name.util';

type GenerateExpenseSlugType = {
  description: string;
  maxWords?: number;
  defaultSlug: string;
};

export function generateSlug({
  description,
  maxWords = 6,
  defaultSlug,
}: GenerateExpenseSlugType): string {
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
      .toLowerCase()
      .split('-')
      .filter((word) => word && !stopWords.includes(word))
      .slice(0, safeWordSize)
      .join('-') || defaultSlug
  );
}
