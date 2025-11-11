export type FindCacheRequest = {
  page: number;
  pageSize: number;
};

export type FindCacheResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  image: string;
  inscriptions: Inscriptions;
  countInscriptions: number;
}[];

export type Inscriptions = {
  responsible: string;
  email: string;
  phone: string;
  participants: Participants;
  totalValue: number;
  timeToExpiration: string;
}[];

export type Participants = {
  name: string;
  birthDateISO: string;
  gender: string;
  typeInscriptionId: string;
  typeInscription: string;
  value: number;
}[];
