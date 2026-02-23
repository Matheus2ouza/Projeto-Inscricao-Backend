import { Utils } from 'src/shared/utils/utils';
import { PaymentInstallmentValidatorFactory } from '../factories/payment-installment/payment-installment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentInstallmentCreateDto = {
  paymentId: string;
  installmentNumber: number;
  received?: boolean;
  value: number;
  netValue: number;
  asaasPaymentId?: string;
  financialMovementId?: string;
  estimatedAt?: Date;
  paidAt: Date;
};

export type PaymentInstallmentWithDto = {
  id: string;
  paymentId: string;
  installmentNumber: number;
  received: boolean;
  value: number;
  netValue: number;
  asaasPaymentId?: string;
  financialMovementId?: string;
  paidAt: Date;
  estimatedAt?: Date;
  createdAt: Date;
};

export class PaymentInstallment extends Entity {
  constructor(
    id: string,
    private paymentId: string,
    private installmentNumber: number,
    private received: boolean,
    private value: number,
    private netValue: number,
    private paidAt: Date,
    createdAt: Date,
    private estimatedAt?: Date,
    private asaasPaymentId?: string,
    private financialMovementId?: string,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    paymentId,
    installmentNumber,
    received,
    value,
    netValue,
    asaasPaymentId,
    financialMovementId,
    paidAt,
    estimatedAt,
  }: PaymentInstallmentCreateDto): PaymentInstallment {
    const id = Utils.generateUUID();
    const receivedDefault = received || false;
    const paidAtDefault = paidAt || new Date();
    const createdAt = new Date();

    return new PaymentInstallment(
      id,
      paymentId,
      installmentNumber,
      receivedDefault,
      value,
      netValue,
      paidAtDefault,
      createdAt,
      estimatedAt,
      asaasPaymentId,
      financialMovementId,
    );
  }

  public static with({
    id,
    paymentId,
    installmentNumber,
    received,
    value,
    netValue,
    asaasPaymentId,
    financialMovementId,
    paidAt,
    estimatedAt,
    createdAt,
  }: PaymentInstallmentWithDto): PaymentInstallment {
    return new PaymentInstallment(
      id,
      paymentId,
      installmentNumber,
      received,
      value,
      netValue,
      paidAt,
      createdAt,
      estimatedAt,
      asaasPaymentId,
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

  public getReceived(): boolean {
    return this.received;
  }

  public getValue(): number {
    return this.value;
  }

  public getNetValue(): number {
    return this.netValue;
  }

  public getAsaasPaymentId(): string | undefined {
    return this.asaasPaymentId;
  }

  public getFinancialMovementId(): string | undefined {
    return this.financialMovementId;
  }

  public getPaidAt(): Date {
    return this.paidAt;
  }
  public getEstimatedAt(): Date | undefined {
    return this.estimatedAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public setReceived(received: boolean): void {
    this.received = received;
    this.updatedAt = new Date();
    this.validate();
  }
}
