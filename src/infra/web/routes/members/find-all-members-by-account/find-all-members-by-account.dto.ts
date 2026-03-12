import { ShirtSize, ShirtType } from 'generated/prisma';

export type FindAllMembersByAccountUsecaseRequest = {
  eventId: string;
  accountId: string;
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
  registered: boolean;
}[];
