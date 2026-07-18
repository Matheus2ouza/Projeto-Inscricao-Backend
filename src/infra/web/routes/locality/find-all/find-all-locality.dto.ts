import { UF } from 'generated/prisma';

export type FindAllLocalityResponse = {
  id: string;
  name: string;
  uf: UF;
}[];
