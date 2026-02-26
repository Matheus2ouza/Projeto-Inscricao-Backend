import { InscriptionStatus } from 'generated/prisma';

export type FindAllPaginatedInscriptionRequest = {
  eventId: string;
  status: InscriptionStatus[];
  isGuest?: string | boolean;
  orderBy?: 'asc' | 'desc';
  limitTime?: string;
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
  totalGuestInscription?: number;
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
