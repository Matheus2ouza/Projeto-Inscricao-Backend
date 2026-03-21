export type ListParticipantsRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListParticipantsResponse = {
  participants: Participant[];
  countParticipants: number;
  countParticipantsMale: number;
  countParticipantsFemale: number;
  total: number;
  page: number;
  pageCount: number;
};

export type Participant = {
  id: string;
  name: string;
  preferredName: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
  shirtSize: string;
  shirtType: string;
  guest: boolean;
};
