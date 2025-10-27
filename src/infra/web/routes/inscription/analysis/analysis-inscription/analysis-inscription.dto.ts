export type AnalysisInscriptionRequest = {
  page: number;
  pageSize: number;
};

export type AnalysisInscriptionResponse = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  status: string;
  participants: {
    id: string;
    name: string;
    birthDate: Date;
    gender: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
