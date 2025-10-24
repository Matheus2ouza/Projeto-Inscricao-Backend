export type InscriptionAnalysisRequest = {
  eventId: string;
};

export type InscriptionAnalysisResponse = {
  account: {
    id: string;
    username: string;
    inscriptions: {
      responsible: string;
      phone: string;
      totalValue: number;
      status: string;
    }[];
  }[];
};
