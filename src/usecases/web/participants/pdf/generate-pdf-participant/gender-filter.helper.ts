import { genderType } from 'generated/prisma';
import type { ParticipantPdfEntry } from 'src/shared/utils/pdfs/participants/participants-by-account-pdf-generator.util';

export type GenderFilter = genderType;
export type GenderFilterInput = Array<GenderFilter | string>;

const toGenderFilter = (value: string | undefined | null): GenderFilter | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toString().toUpperCase();

  if (normalized === 'MASCULINO') {
    return 'MASCULINO';
  }

  if (normalized === 'FEMININO') {
    return 'FEMININO';
  }

  return null;
};

export const resolveGenderFilters = (
  filters?: GenderFilterInput,
): Set<GenderFilter> | null => {
  if (!filters?.length) {
    return null;
  }

  const genders = new Set<GenderFilter>();

  for (const filter of filters) {
    const gender = toGenderFilter(filter?.toString());

    if (gender) {
      genders.add(gender);
    }
  }

  return genders.size ? genders : null;
};

export const matchesAllowedGender = (
  gender: string | undefined | null,
  allowedGenders: Set<GenderFilter> | null,
): boolean => {
  if (!allowedGenders) {
    return true;
  }

  if (!gender) {
    return false;
  }

  const normalized = gender.toString().toUpperCase();
  return allowedGenders.has(normalized as GenderFilter);
};

export const countGenderBreakdown = (
  participants: ParticipantPdfEntry[],
): { totalMale: number; totalFemale: number } => {
  let totalMale = 0;
  let totalFemale = 0;

  for (const participant of participants) {
    const normalized = participant.gender?.toString().toUpperCase() ?? '';

    if (normalized === 'MASCULINO') {
      totalMale += 1;
      continue;
    }

    if (normalized === 'FEMININO') {
      totalFemale += 1;
    }
  }

  return { totalMale, totalFemale };
};
