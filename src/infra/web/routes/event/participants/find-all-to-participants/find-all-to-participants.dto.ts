export type FindAllToParticipantsRequest = {
  page: number;
  pageSize: number;
};

export type FindAllToParticipantsResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl?: string;
  countInscriptions: number;
  countParticipants: number;
}[];
