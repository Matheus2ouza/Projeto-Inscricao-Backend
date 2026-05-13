export type FindAllExclusiveInscriptionLinkParam = {
  eventId: string;
};

export type FindAllExclusiveInscriptionLinkQuery = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type FindAllExclusiveInscriptionLinkResponse = {
  event: Event;
  exclusiveInscriptionLinks: ExclusiveInscriptionLink[];
  total: number;
  page: number;
  pageCount: number;
};

type Event = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  countExckusiveInscriptionLinks: number;
  countExckusiveInscriptionLinksEnabled: number;
  countExckusiveInscriptionLinksDisabled: number;
};

type ExclusiveInscriptionLink = {
  id: string;
  name: string;
  token: string;
  expiresAt: Date;
  active: boolean;
  countInscriptions: number;
  typeInscriptionAllowed: TypeInscriptionAllowed[];
};

type TypeInscriptionAllowed = {
  id: string;
  description: string;
  value: number;
  specialType: boolean;
  rule?: Date;
  active: boolean;
  participantLimit: number;
  limitIsStrict: boolean;
  currentCount: number;
};
