export type FindAllWithInscriptionsRequest = {
  page: number;
  pageSize: number;
};

export type FindAllWithInscriptionsResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
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
