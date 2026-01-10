export type FindAllMembersByAccountUsecaseRequest = {
  id: string;
};

export type FindAllMembersByAccountUsecaseResponse = {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
}[];
