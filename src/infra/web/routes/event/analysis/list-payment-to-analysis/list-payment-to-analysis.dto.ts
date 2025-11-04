export type ListPaymentToAnalysisRequest = {
  eventId: string;
};

export type ListPaymentToAnalysisResponse = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      id: string;
      responsible: string;
      totalValue: number;
      countPayments: number;
    }[];
  }[];
};
