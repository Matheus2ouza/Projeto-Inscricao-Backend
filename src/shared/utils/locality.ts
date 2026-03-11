const DIACRITICS_REGEX = /[\u0300-\u036f]/g;
const NON_ALNUM_REGEX = /[^A-Z0-9]+/g;

export function normalizeLocalityText(input?: string | null): string {
  const raw = (input ?? '').trim();
  if (!raw) return '';

  return raw
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toUpperCase()
    .replace(NON_ALNUM_REGEX, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const DROP_TOKENS = new Set(['PA', 'PARA', 'MA', 'MARANHAO', 'DO', 'DA', 'DE']);

function tokensWithoutNoise(tokens: string[]): string[] {
  return tokens.filter((t) => t && !DROP_TOKENS.has(t));
}

function titleCasePtBr(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function canonicalLocality(input?: string | null): string {
  const normalized = normalizeLocalityText(input);
  if (!normalized) return '';

  const tokens = normalized.split(' ');
  const tokensNoNoise = tokensWithoutNoise(tokens);
  const tokenSet = new Set(tokensNoNoise);

  if (tokenSet.has('BELEM')) return 'Belém';
  if (tokenSet.has('CASTANHAL')) return 'Castanhal';
  if (tokenSet.has('PARAUAPEBAS')) return 'Parauapebas';
  if (tokenSet.has('ANANINDEUA')) return 'Ananindeua';
  if (tokenSet.has('MARABA')) return 'Marabá';
  if (tokenSet.has('BARCARENA')) return 'Barcarena';
  if (tokenSet.has('ALTAMIRA')) return 'Altamira';
  if (tokenSet.has('CURUCA')) return 'Curuçá';
  if (tokenSet.has('PARAGOMINAS')) return 'Paragominas';
  if (tokenSet.has('RAPOSA')) return 'Raposa';
  if (tokenSet.has('BACABAL')) return 'Bacabal';
  if (tokenSet.has('SAO') && tokenSet.has('LUIS')) return 'São Luís';

  if (tokenSet.has('ELDORADO') && tokenSet.has('CARAJAS')) {
    return 'Eldorado dos Carajás';
  }

  if (tokenSet.has('ELDORADO')) return 'Eldorado dos Carajás';

  if (tokenSet.has('DOM') && tokenSet.has('ELISEU')) return 'Dom Eliseu';

  if (tokenSet.has('ITINGA') && tokenSet.has('MARANHAO')) {
    return 'Itinga do Maranhão';
  }

  if (
    tokenSet.has('ALTO') &&
    tokenSet.has('ALEGRE') &&
    tokenSet.has('MARANHAO')
  ) {
    return 'Alto Alegre do Maranhão';
  }

  if (tokenSet.has('LAGO') && tokenSet.has('JUNCO')) return 'Lago do Junco';

  return titleCasePtBr(tokensNoNoise.join(' '));
}

export function matchesLocality(
  input?: string | null,
  target?: string | null,
): boolean {
  const a = canonicalLocality(input);
  const b = canonicalLocality(target);
  if (!a || !b) return false;
  return a === b;
}
