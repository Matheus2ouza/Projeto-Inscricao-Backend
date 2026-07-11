export type UpdateTypeInscriptionRequest = {
  description: string;
  value: number;
  specialType: boolean;
  rule: number | null;
};

export type UpdateTypeInscriptionResponse = {
  id: string;
};
