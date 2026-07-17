import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type CreateInscriptionAdminRequest = {
  localityId: string;
  eventId: string;

  // para ver se é inscrição Guest
  isGuest: boolean;

  // Dados Normais
  accountId?: string;
  responsible: string;
  email: string;
  phone: string;

  participants: ParticipantInscription[];
};

export type ParticipantInscription = {
  // Se for normal envia somente os dados do membro
  accountParticipantId?: string;

  // Se for Guest envia os dados do Participante
  name?: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate?: string;
  cpf?: string;
  gender?: genderType;

  // Unico dado que é obrigatório em ambas as situações
  typeInscriptionId: string;
};

export type CreateInscriptionAdminResponse = {
  id: string;
};
