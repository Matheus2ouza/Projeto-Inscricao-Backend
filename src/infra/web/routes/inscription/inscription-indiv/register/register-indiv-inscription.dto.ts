export type RegisterIndivInscriptionUsecaseRequest = {
  accountId: string;
  eventId: string;
  responsible: string;
  email: string;
  phone: string;
  member: member;
};

export type member = {
  accountParticipantId: string;
  typeInscriptionId: string;
};

export type RegisterIndivInscriptionUsecaseResponse = {
  inscriptionId: string;
};
