export type FindTypeInscriptionByEventIdRequest = {
  eventId: string;
};

export type FindTypeInscriptionByEventIdResponse = {
  id: string;
  description: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}[];
