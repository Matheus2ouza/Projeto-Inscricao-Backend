export type RegisterGroupInscriptionUsecaseRequest = {
  accountId: string;
  eventId: string;
  responsible: string;
  email?: string;
  phone: string;
  members: member[];
};

export type member = {
  accountParticipantId: string;
  typeInscriptionId: string;
};

export type RegisterGroupInscriptionUsecaseResponse = {
  inscriptionId: string;
};
