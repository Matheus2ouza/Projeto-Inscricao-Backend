import { StatusPayment } from 'generated/prisma';
import { PaymentsSummary } from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import { Payment } from '../entities/payment.entity';

export abstract class PaymentGateway {
  // CRUD básico
  abstract create(payment: Payment): Promise<Payment>;

  // Buscas e listagens
  abstract findById(id: string): Promise<Payment | null>;
  abstract findAllPaginated(
    accountId: string,
    eventId: string,
    page: number,
    pageSize: number,
    filter?: {
      status?: StatusPayment[];
    },
  ): Promise<Payment[]>;

  // Agregações e contagens
  abstract countAllFiltered(
    accountId: string,
    eventId: string,
    filters?: {
      status?: StatusPayment[];
    },
  ): Promise<number>;
  abstract countAllOrdered(
    accountId: string,
    eventId: string,
  ): Promise<PaymentsSummary>;
  abstract countTotalPaid(
    accountId: string,
    eventId: string,
    filter: {
      limitTime?: string;
    },
  ): Promise<number>;

  // Atualizações

  //Deletes
  abstract delete(id: string): Promise<void>;
}
