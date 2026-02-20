export type AnalysisInscriptionRequest = {
  id: string;
  page: number;
  pageSize: number;
};

export type AnalysisInscriptionResponse = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  status: string;
  participants: Participants;
  total: number;
  page: number;
  pageCount: number;
};

export type Participants = {
  id: string;
  name: string;
  birthDate: Date;
  typeInscription?: string;
  gender: string;
}[];
