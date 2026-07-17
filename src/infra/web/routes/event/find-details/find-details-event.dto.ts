import { statusEvent } from 'generated/prisma';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';

export type FindDetailsEventRequest = {
  eventId: string;
};

export type TypeInscription = {
  id: string;
  description: string;
  value: number;
  rule: Date | null;
  specialType: boolean;
};

export type FindDetailsEventResponse = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  paymentEnabled: boolean;
  regionName?: string;
  participanteConfig: ParticipantFieldsConfig;
};
