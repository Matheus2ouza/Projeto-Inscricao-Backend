import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';

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
  logo?: string;
  location?: string;
  longitude?: number | null;
  latitude?: number | null;
  status: statusEvent;
  allowedInscriptionModes: InscriptionMode[];
  allowedPaymentModes: PaymentMode[];
  paymentEnebled: boolean;
  createdAt: Date;
  regionName: string;
  participanteConfig: ParticipantFieldsConfig;
  responsibles: Responsible[];
};

export type Responsible = {
  id: string;
  name: string;
};
