export type ReportFinancialRequest = {
  eventId: string;
  details: boolean;
};

export type ReportFinancialResponse = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  logo?: string;

  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  totalSpent: number;
  inscription: Inscription;
  inscriptionAvuls: InscriptionAvuls;
  spent: Spent;
};

export type Inscription = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  countParticipants: number;
  details?: InscriptionDetail[];
};

export type InscriptionDetail = {
  id: string;
  createdAt: Date;
  totalPaid: number;
  paidCash: number;
  paidCard: number;
  paidPix: number;
};

export type InscriptionAvuls = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  countParticipants: number;
  details?: InscriptionAvulsDetail[];
};

export type InscriptionAvulsDetail = {
  id: string;
  createdAt: Date;
  totalPaid: number;
  paidCash: number;
  paidCard: number;
  paidPix: number;
};

export type Spent = {
  totalGeral: number;
  totalCash: number;
  totalCard: number;
  totalPix: number;
  spentDetails?: SpentDetail[];
};

export type SpentDetail = {
  id: string;
  createdAt: Date;
  totalSpent: number;
};
