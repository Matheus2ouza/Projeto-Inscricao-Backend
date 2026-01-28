import { Utils } from 'src/shared/utils/utils';
import { PaymentInstallmentValidatorFactory } from '../factories/payment-installment/payment-installment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentInstallmentCreateDto = {
  paymentId: string;
  installmentNumber: number;
  value: number;
  netValue: number;
  asaasPaymentId: string;
  financialMovementId?: string;
  paidAt: Date;
};

export type PaymentInstallmentWithDto = {
  id: string;
  paymentId: string;
  installmentNumber: number;
  value: number;
  netValue: number;
  asaasPaymentId: string;
  financialMovementId?: string;
  paidAt: Date;
  createdAt: Date;
};

export class PaymentInstallment extends Entity {
  constructor(
    id: string,
    private paymentId: string,
    private installmentNumber: number,
    private value: number,
    private netValue: number,
    private asaasPaymentId: string,
    private paidAt: Date,
    createdAt: Date,
    private financialMovementId?: string,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    paymentId,
    installmentNumber,
    value,
    netValue,
    asaasPaymentId,
    financialMovementId,
    paidAt,
  }: PaymentInstallmentCreateDto): PaymentInstallment {
    const id = Utils.generateUUID();
    const paidAtDefault = paidAt || new Date();
    const createdAt = new Date();

    return new PaymentInstallment(
      id,
      paymentId,
      installmentNumber,
      value,
      netValue,
      asaasPaymentId,
      paidAtDefault,
      createdAt,
      financialMovementId,
    );
  }

  public static with({
    id,
    paymentId,
    installmentNumber,
    value,
    netValue,
    asaasPaymentId,
    financialMovementId,
    paidAt,
    createdAt,
  }: PaymentInstallmentWithDto): PaymentInstallment {
    return new PaymentInstallment(
      id,
      paymentId,
      installmentNumber,
      value,
      netValue,
      asaasPaymentId,
      paidAt,
      createdAt,
      financialMovementId,
    );
  }

  protected validate(): void {
    PaymentInstallmentValidatorFactory.create().validate(this);
  }

  public getId(): string {
    return this.id;
  }

  public getPaymentId(): string {
    return this.paymentId;
  }

  public getInstallmentNumber(): number {
    return this.installmentNumber;
  }

  public getValue(): number {
    return this.value;
  }

  public getNetValue(): number {
    return this.netValue;
  }

  public getAsaasPaymentId(): string {
    return this.asaasPaymentId;
  }

  public getFinancialMovementId(): string | undefined {
    return this.financialMovementId;
  }

  public getPaidAt(): Date {
    return this.paidAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
