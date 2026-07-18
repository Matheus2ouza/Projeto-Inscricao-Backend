import { InscriptionMode } from 'generated/prisma';

export type UpdateInscriptionModeEventParam = {
  id: string;
};
export type UpdateInscriptionModeEventBody = {
  inscriptionMode: InscriptionMode[];
};

export type UpdateInscriptionModeEventResponse = {
  message: 'modified';
  inscriptionMode: InscriptionMode[];
};
