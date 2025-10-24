export type FindAllPaginatedEventToInscriptionRequest = {
  page?: number;
  pageSize?: number;
};

export type FindAllPaginatedEventToInscriptionResponse = {
  events: {
    id: string;
    name: string;
    imageUrl?: string;
    countInscriptions: number;
    countInscritpionsAnalysis: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
