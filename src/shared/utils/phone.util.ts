export function formatPhoneNumber(value?: string | null): string {
  if (!value) {
    return '';
  }

  const digits = String(value)
    .replace(/\D+/g, '')
    .replace(/^55/, '')
    .replace(/^0+/, '');

  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const first = digits.slice(2, 7);
    const last = digits.slice(7);
    return `(${ddd}) ${first}-${last}`;
  }

  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const first = digits.slice(2, 6);
    const last = digits.slice(6);
    return `(${ddd}) ${first}-${last}`;
  }

  if (digits.length === 9) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return value.trim();
}
