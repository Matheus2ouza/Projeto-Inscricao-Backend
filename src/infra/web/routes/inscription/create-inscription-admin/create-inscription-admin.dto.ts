import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';

export type CreateInscriptionAdminRequest = {
  eventId: string;

  // O admin pode setar o status da inscrição
  status: InscriptionStatus;

  // para ver se é inscrição Guest
  isGuest: boolean;

  // Dados Normais
  accountId?: string;
  responsible: string;
  email: string;
  phone: string;

  // Dados Guest
  guestLocality?: string;

  totalValue: number;
  totalPaid?: number;

  participants: ParticipantInscription[];
  // Pode já vir com o pagamento entao é opcional
  payment?: PaymentInscription;
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

export type PaymentInscription = {
  // Se for pagamento de inscrição normal
  accountId?: string;

  // Se for pagamento Guest
  guestName?: string;
  guestEmail?: string;

  status: StatusPayment;
  methodPayment: PaymentMethod;

  totalValue?: number;
  totalPaid?: number;
  installment?: number;

  image?: string;

  approvedBy?: string;
};

export type CreateInscriptionAdminResponse = {
  id: string;
};
