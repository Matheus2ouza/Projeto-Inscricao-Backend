import { ShirtSize, ShirtType, UF } from 'generated/prisma';

export type FindAllMembersByAccountUsecaseParam = {
  eventId: string;
  localityId: string;
};

export type FindAllMembersByAccountUsecaseQuery = {
  eventId: string;
  localityId: string;
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
  locality?: Locality;
}[];

type Locality = {
  id: string;
  name: string;
  uf: UF;
};
