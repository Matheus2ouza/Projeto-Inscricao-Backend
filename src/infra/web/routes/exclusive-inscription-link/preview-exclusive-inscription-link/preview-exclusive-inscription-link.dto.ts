export type PreviewExclusiveInscriptionLinkParams = {
  token: string;
};

export type PreviewExclusiveInscriptionLinkResponse = {
  event: Event;
  exclusiveInscriptionLink: ExclusiveInscriptionLink;
  status: 'valid' | 'inactive' | 'expired';
  canInscribe: boolean;
};

type Event = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  image: string;
};

type ExclusiveInscriptionLink = {
  active: boolean;
  expiresAt: Date;
  countInscriptions: number;
  typeInscriptions: TypeInscriptionAllowed[];
};

type TypeInscriptionAllowed = {
  id: string;
  description: string;
  value: number;
  rule: Date | null;
  specialType: boolean;
  participantLimit: number;
  currentCount: number;
};
