import type { ParticipantPdfEntry } from 'src/shared/utils/pdfs/participants/participants-by-account-pdf-generator.util';

export type TypeCount = {
  type: string;
  count: number;
};

export const buildTypeCounts = (
  participants: ParticipantPdfEntry[],
): TypeCount[] => {
  const counts = new Map<string, number>();

  for (const participant of participants) {
    const type = participant.typeInscription || 'Não informado';
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
};
