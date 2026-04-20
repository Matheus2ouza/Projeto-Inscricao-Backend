import { InscriptionStatus } from 'generated/prisma';

export type FindAllInscriptionParam = {
  eventId: string;
};

export type FindAllInscriptionQuery = {
  eventId: string;
  status: InscriptionStatus[];
  responsible?: string;
};

export type FindAllInscriptionResponse = {
  id: string;
  responsible: string;
  status: string;
  totalValue: number;
  totalPaid: number;
}[];
