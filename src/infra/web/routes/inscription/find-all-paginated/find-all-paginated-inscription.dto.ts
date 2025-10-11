export type FindAllPaginatedInscriptionRequest = {
  eventId?: string;
  limitTime?: string;
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedInscriptionResponse = {
  inscription: {
    id: string;
    responsible: string;
    totalValue: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
  totalInscription: number;
  totalParticipant: number;
  totalDebt: number;
};
