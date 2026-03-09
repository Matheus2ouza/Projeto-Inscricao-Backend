import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import type { FindDetailsMovimentOutput } from 'src/usecases/web/cash-register/find-details-moviment/find-details-moviment.usecase';

export type FindDetailsMovimentRequest = {
  id: string;
};

export type FindDetailsMovimentResponse = {
  id: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  responsible?: string;
  imageUrl?: string;
  createdAt: Date;
  reference: FindDetailsMovimentOutput['reference'];
};
