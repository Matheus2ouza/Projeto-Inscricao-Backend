export type ListGuestParticipantsRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListGuestParticipantsResponse = {
  guestParticipants: GuestParticipant[];
  countGuestParticipants: number;
  countGuestParticipantsMale: number;
  countGuestParticipantsFemale: number;
  total: number;
  page: number;
  pageCount: number;
};

export type GuestParticipant = {
  id: string;
  name: string;
  preferredName: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
  shirtSize: string;
  shirtType: string;
};
