import { InscriptionStatus } from 'generated/prisma';

export type FindAllPaginatedInscriptionParams = {
  eventId: string;
};

export type FindAllPaginatedInscriptionQuery = {
  status: InscriptionStatus[];
  isGuest?: string | boolean;
  orderByCreatedAt?: 'asc' | 'desc';
  orderByResponsible?: 'asc' | 'desc';
  period?: 'all' | '1h' | '24h' | '7d' | '30d';
  responsible?: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedInscriptionResponse = {
  event: Event;
  total: number;
  page: number;
  pageCount: number;
};

export type Event = {
  id: string;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  totalInscription: number;
  totalParticipants: number;
  totalPaid: number;
  totalDue: number;
  inscriptions: Inscription[];
};

export type Inscription = {
  id: string;
  responsible: string;
  status: string;
  totalParticipant: number;
};
