import { UF } from 'generated/prisma';

export type FindAllByEventParam = {
  eventId: string;
};

export type FindAllByEventResponse = {
  id: string;
  name: string;
  uf: UF;
}[];
