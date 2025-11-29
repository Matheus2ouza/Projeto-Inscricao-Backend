import { statusEvent } from 'generated/prisma';

export type FindDetailsEventRequest = {
  eventId: string;
};

export type TypeInscription = {
  description: string;
  value: number;
};

export type FindDetailsEventResponse = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnabled: boolean;
  regionName?: string;
  typeInscriptions: TypeInscription[];
};
