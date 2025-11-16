export type ListParticipantsRequest = {
  page: number;
  pageSize: number;
};

export type ListParticipantsResponse = {
  account: Accounts;
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
  birthDate: string;
  gender: string;
}[];
