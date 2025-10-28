export type ListPaymentToAnalysisRequest = {
  eventId: string;
};

export type ListPaymentToAnalysisResponse = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      responsible: string;
      totalValue: number;
      countPayments: number;
    }[];
  }[];
};
