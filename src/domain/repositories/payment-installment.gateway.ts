import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { PaymentInstallment } from '../entities/payment-installment.entity';

export abstract class PaymentInstallmentGateway {
  // CRUD básico
  abstract create(
    paymentInstallment: PaymentInstallment,
  ): Promise<PaymentInstallment>;
  abstract createTx(
    paymentInstallment: PaymentInstallment,
    tx: PrismaTransactionClient,
  ): Promise<PaymentInstallment>;
  abstract createMany(paymentInstallment: PaymentInstallment[]): Promise<void>;
  abstract update(
    paymentInstallment: PaymentInstallment,
  ): Promise<PaymentInstallment>;
  abstract deleteMany(paymentId: string): Promise<void>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<PaymentInstallment | null>;

  // Busca a parcela atravez do id unico do asaas
  abstract findByAsaasPaymentId(
    asaasPaymentId: string,
  ): Promise<PaymentInstallment | null>;

  abstract findByPaymentId(paymentId: string): Promise<PaymentInstallment[]>;
  abstract findManyByPaymentId(
    paymentId: string,
  ): Promise<PaymentInstallment[]>;
  abstract findByRegionId(regionId: string): Promise<PaymentInstallment[]>;
  abstract findFutureReleasesByEventId(
    eventId: string,
  ): Promise<PaymentInstallment[]>;

  abstract sumExpectedValues(eventId: string): Promise<{
    value: number;
    netValue: number;
  }>;

  abstract sumTotalAssasValues(eventId: string): Promise<{
    value: number;
    netValue: number;
  }>;
}
