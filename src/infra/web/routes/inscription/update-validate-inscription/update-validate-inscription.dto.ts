export type UpdateValidateInscriptionRequest = {
  inscriptionId: string;
  expiresAt: Date;
};

export type UpdateValidateInscriptionResponse = {
  id: string;
  expiresAt?: Date;
};
