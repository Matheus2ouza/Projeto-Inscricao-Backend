import { ShirtSize, ShirtType } from 'generated/prisma';

export type FindAllMembersByAccountUsecaseRequest = {
  userId: string;
  eventId: string;
};

export type FindAllMembersByAccountUsecaseResponse = {
  id: string;
  name: string;
  cpf?: string;
  preferredName?: string;
  birthDate: Date;
  gender: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
}[];
