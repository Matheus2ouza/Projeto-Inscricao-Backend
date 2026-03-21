import type { GenderFilter } from 'src/usecases/web/participants/reports/pdf/generate-pdf-participant/gender-filter.helper';

export type GeneratePdfAllParticipantsAllRequest = {
  eventId: string;
};

export type GeneratePdfParticipantsAllBody = {
  genders?: GenderFilter[];
};

export type GeneratePdfAllParticipantsAllResponse = {
  pdfBase64: string;
  filename: string;
};
