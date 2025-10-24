import { statusEvent } from 'generated/prisma';

export type CreateEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  image?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  paymentEnabled: boolean;
  responsibles: {
    accountId: string;
  }[];
};

export type CreateEventRouteResponse = {
  id: string;
};
