import { InscriptionStatus } from 'generated/prisma';

export type ListParticipantsParams = {
  eventId: string;
};

export type ListParticipantsQuery = {
  page: number;
  pageSize: number;

  // filters
  inscriptionStatus: InscriptionStatus[];
  typeInscriptions: string[];
  orderByName: 'asc' | 'desc';
};

export type ListParticipantsResponse = {
  participants: Participant[];
  countParticipants: number;
  countParticipantsMale: number;
  countParticipantsFemale: number;
  typesInscriptionsInUse: TypeInscription[];
  total: number;
  page: number;
  pageCount: number;
};

export type Participant = {
  id: string;
  name: string;
  preferredName: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
  shirtSize: string;
  shirtType: string;
  guest: boolean;
};

type TypeInscription = {
  id: string;
  description: string;
};
