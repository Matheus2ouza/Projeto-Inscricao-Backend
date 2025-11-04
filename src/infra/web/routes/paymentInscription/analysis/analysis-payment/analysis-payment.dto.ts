export type AnalysisPaymentRequest = {
  inscriptionId: string;
};

export type AnalysisPaymentResponse = {
  id: string;
  responsible: string;
  phone: string;
  email?: string;
  totalValue: number;
  payments: {
    id: string;
    status: string;
    value: number;
    image: string;
  }[];
};
