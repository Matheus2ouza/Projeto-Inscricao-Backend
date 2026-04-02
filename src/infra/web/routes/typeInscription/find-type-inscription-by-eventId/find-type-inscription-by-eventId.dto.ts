export type FindTypeInscriptionByEventIdRequest = {
  eventId: string;
};

export type FindTypeInscriptionByEventIdResponse = {
  id: string;
  description: string;
  rule: Date | null;
  value: number;
  specialType: boolean;
  active: boolean;
  createdAt: Date;
}[];
