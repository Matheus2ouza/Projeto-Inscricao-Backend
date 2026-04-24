import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
  genderType,
} from 'generated/prisma';

export function formatInscriptionStatus(status: InscriptionStatus): string {
  switch (status) {
    case 'PAID':
      return 'Pago';
    case 'PENDING':
      return 'Pendente';
    case 'UNDER_REVIEW':
      return 'Em análise';
    case 'CANCELLED':
      return 'Cancelado';
    case 'EXPIRED':
      return 'Expirado';
    default:
      return String(status);
  }
}

export function formatPaymentMethod(method: PaymentMethod): string {
  switch (method) {
    case 'PIX':
      return 'PIX';
    case 'CARTAO':
      return 'Cartão';
    case 'DINHEIRO':
      return 'Dinheiro';
    default:
      return String(method);
  }
}

export function formatPaymentStatus(status: StatusPayment): string {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado';
    case 'UNDER_REVIEW':
      return 'Em análise';
    case 'REFUSED':
      return 'Recusado';
    default:
      return String(status);
  }
}

export function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

export function formatDate(date?: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatAge(date?: Date | null): string {
  if (!date) return '';

  const birthDate = new Date(date);
  if (Number.isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age < 0 ? '' : String(age);
}

export function formatGender(gender?: genderType | null): string {
  if (!gender) return 'Não informado';

  switch (gender) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender).charAt(0) + String(gender).slice(1).toLowerCase();
  }
}
