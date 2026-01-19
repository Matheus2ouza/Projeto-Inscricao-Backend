export type FindAllMembersByAccountUsecaseRequest = {
  userId: string;
  eventId: string;
};

export type FindAllMembersByAccountUsecaseResponse = {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
  registered?: boolean;
}[];
