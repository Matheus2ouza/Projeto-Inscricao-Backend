export type FindAllPaginatedOnSiteRegistrationRequest = {
  eventId: string;
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedOnSiteRegistrationResponse = {
  registrations: {
    id: string;
    responsible: string;
    phone?: string;
    totalValue: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
  totals: {
    totalDinheiro: number;
    totalCartao: number;
    totalPix: number;
    totalGeral: number;
  };
};
