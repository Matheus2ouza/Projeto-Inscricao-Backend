export type ListInscriptonToAnalysisRequest = {
  eventId: string;
};

export type ListInscriptonToAnalysisResponse = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      id: string;
      responsible: string;
      phone: string;
      totalValue: number;
      status: string;
    }[];
  }[];
};
