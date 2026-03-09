import { statusEvent } from 'generated/prisma';

export type FindAllNamesEventRequest = {
  status?: statusEvent[];
};

export type FindAllNamesEventResponse = {
  id: string;
  name: string;
}[];
