export type FindDetailsInscriptionRequest = {
  id: string;
};

export type FindDetailsInscriptionResponse = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  totalValue: number;
  status: string;
  createdAt: Date;
  payments?: {
    id: string;
    status: string;
    value: number;
    image: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  participants: {
    id: string;
    typeInscription: string | undefined;
    name: string;
    birthDate: Date;
    gender: string;
  }[];
  countParticipants: number;
};
