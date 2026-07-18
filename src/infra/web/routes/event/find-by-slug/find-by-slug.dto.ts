import { InscriptionMode, statusEvent } from 'generated/prisma';

export type FindBySlugEventRequest = {
  slug: string;
};

export type FindBySlugEventResponse = {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  image?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  allowedInscriptionModes: InscriptionMode[];
  createdAt: Date | string;
  regionName: string;
};
