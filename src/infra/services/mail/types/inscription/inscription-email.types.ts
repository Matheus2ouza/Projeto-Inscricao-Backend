export interface InscriptionEmailData {
  eventName: string;
  eventImageUrl?: string;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail?: string;
  totalValue: number;
  participantCount: number;
  accountUsername?: string;
  inscriptionDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  eventLocation?: string;
}

export interface ParticipantEmailData {
  name: string;
  typeInscription: string;
  value: number;
  gender: string;
  birthDate: Date;
}

export interface EventResponsibleEmailData {
  id: string;
  username: string;
  email?: string;
}

export interface InscriptionEmailTemplateData {
  eventData: InscriptionEmailData;
  responsibles: EventResponsibleEmailData[];
}
