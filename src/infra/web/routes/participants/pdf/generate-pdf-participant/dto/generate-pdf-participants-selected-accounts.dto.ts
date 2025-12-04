import type { GenderFilter } from 'src/usecases/web/participants/pdf/generate-pdf-participant/gender-filter.helper';

export type GeneratePdfParticipantsSelectedAccountsParams = {
  eventId: string;
};

export type GeneratePdfParticipantsSelectedAccountsBody = {
  accountsId: string[];
  genders?: GenderFilter[];
};

export type GeneratePdfParticipantsSelectedAccountsResponse = {
  pdfBase64: string;
  filename: string;
};
