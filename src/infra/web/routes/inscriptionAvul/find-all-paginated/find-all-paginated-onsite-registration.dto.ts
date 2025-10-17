export type FindAllPaginatedOnSiteRegistrationRequest = {
  eventId: string;
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedOnSiteRegistrationResponse = {
  registrations: {
    id: string;
    responsible: string;
    phone: string;
    totalValue: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
