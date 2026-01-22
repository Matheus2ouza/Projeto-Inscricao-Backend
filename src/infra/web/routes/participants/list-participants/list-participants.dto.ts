export type ListParticipantsRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListParticipantsResponse = {
  accounts: Account[];
  countAccounts: number;
  countParticipants: number;
  countParticipantsMale: number;
  countParticipantsFemale: number;
  total: number;
  page: number;
  pageCount: number;
};

export type Account = {
  id: string;
  username: string;
  countParticipants: number;
  participants: Participants;
};

export type Participants = {
  id: string;
  name: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
}[];
