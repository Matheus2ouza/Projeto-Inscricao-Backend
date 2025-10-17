export type ListInscriptionRequest = {
  page: number;
  pageSize: number;
};

export type ListInscriptionResponse = {
  id: string;
  name: string;
  quantityParticipants: number;
  inscriptions: {
    id: string;
    responsible: string;
    phone: string;
    status: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
