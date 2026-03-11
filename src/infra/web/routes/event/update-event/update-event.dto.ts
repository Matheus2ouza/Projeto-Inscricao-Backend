import { InscriptionMode } from 'generated/prisma';

export type UpdateEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  responsibles: string[];
  allowedInscriptionModes: InscriptionMode[];
};

export type UpdateEventRouteResponse = {
  id: string;
};
