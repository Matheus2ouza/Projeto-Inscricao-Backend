export type CreateExclusiveInscriptionLinkBody = {
  eventId: string;
  typeInscriptionIds: string[];
  name: string;
  expiresAt: Date;
};

export type CreateExclusiveInscriptionLinkResponse = {
  id: string;
};
