import { statusEvent } from 'generated/prisma';

export type FindByIdEventRequest = {
  id: string;
};

export type FindByIdEventOutput = {
  id: string;
  name: string;
  quantityParticipants: number;
  amountCollected: number;
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEneble: boolean;
  createdAt: Date;
  updatedAt: Date;
  regionName: string;
};
