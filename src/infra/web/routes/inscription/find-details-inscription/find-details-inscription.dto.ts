export type FindDetailsInscriptionRequest = {
  id: string;
};

export type FindDetailsInscriptionResponse = {
  inscription: Inscription;
  participants: Participant[];
  payments: Payment[];
};

type Inscription = {
  id: string;
  responsible: string;
  email?: string;
  phone?: string;
  status: string;
  totalValue: number;
  totalPaid: number;
  totalDebt: number;
  createdAt: Date;
};

type Participant = {
  id: string;
  typeInscription: string | undefined;
  name: string;
  birthDate: Date;
  gender: string;
};

type Payment = {
  id: string;
  value: number;
  createdAt: Date;
};
