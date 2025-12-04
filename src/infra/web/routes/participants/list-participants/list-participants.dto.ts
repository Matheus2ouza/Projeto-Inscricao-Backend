export type ListParticipantsRequest = {
  page: number;
  pageSize: number;
};

export type ListParticipantsResponse = {
  account: Accounts;
  countAccounts: number;
  countParticipants: number;
  total: number;
  page: number;
  pageCount: number;
};

export type Accounts = {
  id: string;
  username: string;
  countParticipants: number;
  participants: Participants;
}[];

export type Participants = {
  id: string;
  name: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
}[];
