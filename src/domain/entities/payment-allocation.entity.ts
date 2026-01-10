import { Utils } from 'src/shared/utils/utils';
import { PaymentAllocationValidatorFactory } from '../factories/payment-allocation/payment-allocation.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentAllocationCreateDto = {
  paymentId: string;
  inscriptionId: string;
  value: number;
};

export type PaymentAllocationWithDto = {
  id: string;
  paymentId: string;
  inscriptionId: string;
  value: number;
  createdAt: Date;
};

export class PaymentAllocation extends Entity {
  constructor(
    id: string,
    private paymentId: string,
    private inscriptionId: string,
    private value: number,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
  }

  public static create({
    paymentId,
    inscriptionId,
    value,
  }: PaymentAllocationCreateDto): PaymentAllocation {
    const id = Utils.generateUUID();
    const createdAt = new Date();

    return new PaymentAllocation(
      id,
      paymentId,
      inscriptionId,
      value,
      createdAt,
    );
  }

  public static with({
    id,
    paymentId,
    inscriptionId,
    value,
    createdAt,
  }: PaymentAllocationWithDto): PaymentAllocation {
    return new PaymentAllocation(
      id,
      paymentId,
      inscriptionId,
      value,
      createdAt,
    );
  }

  protected validate(): void {
    PaymentAllocationValidatorFactory.create().validate(this);
  }

  public getId(): string {
    return this.id;
  }

  public getPaymentId(): string {
    return this.paymentId;
  }

  public getInscriptionId(): string {
    return this.inscriptionId;
  }

  public getValue(): number {
    return this.value;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
