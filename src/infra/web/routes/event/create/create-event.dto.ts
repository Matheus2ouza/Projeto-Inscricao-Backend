import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';

export type CreateEventRequest = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId?: string;
  image?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  allowedInscriptionModes: InscriptionMode[];
  allowedPaymentModes: PaymentMode[];
  participantFieldsConfig?: ParticipantFieldsConfig;
  paymentEnabled: boolean;
  responsibles: {
    accountId: string;
  }[];
};

export type CreateEventRouteResponse = {
  id: string;
};
