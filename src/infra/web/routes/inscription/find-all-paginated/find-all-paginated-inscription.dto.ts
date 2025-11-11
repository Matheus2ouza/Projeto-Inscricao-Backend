export type FindAllPaginatedInscriptionRequest = {
  limitTime?: string;
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedInscriptionResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
  totalInscription: number;
  totalParticipant: number;
  totalDebt: number;
};

export type Events = {
  id: string;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  totalParticipant: number;
  totalDebt: number;
  inscriptions: Inscriptions;
}[];

export type Inscriptions = {
  id: string;
  responsible: string;
  totalValue: number;
  status: string;
}[];
