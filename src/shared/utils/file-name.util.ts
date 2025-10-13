export function generateUniqueFileName(
  prefix: string,
  extension: string,
): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}
