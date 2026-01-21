export type ListPaymentPendingDetailsRequest = {
  inscriptionId: string;
  page: number;
  pageSize: number;
};

export type ListPaymentPendingDetailsResponse = {
  inscription: Inscription;
  participant: Participant[];
  payments: Payment[];
  allowCard: boolean;
  totalParticipant: number;
  totalPayment: number;
  page: number;
  pageCount: number;
};

type Inscription = {
  id: string;
  eventId: string;
  responsible: string;
  totalValue: number;
  status: string;
  createdAt: Date;
};

type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
};

type Payment = {
  id: string;
  status: string;
  totalValue: number;
  imageUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
};
