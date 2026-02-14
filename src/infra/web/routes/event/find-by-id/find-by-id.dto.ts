import { statusEvent } from 'generated/prisma';

export type FindByIdEventRequest = {
  id: string;
};

export type FindByIdEventResponse = {
  id: string;
  name: string;
  quantityParticipants: number;
  amountCollected: number;
  startDate: Date;
  endDate: Date;
  image?: string;
  logoUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnebled: boolean;
  allowCard?: boolean;
  allowGuest: boolean;
  createdAt: Date;
  regionName: string;
  responsibles: Responsible[];
};

export type Responsible = {
  id: string;
  name: string;
};
