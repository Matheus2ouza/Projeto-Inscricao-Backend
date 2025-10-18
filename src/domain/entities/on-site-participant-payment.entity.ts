import Decimal from 'decimal.js';
import { PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type OnSiteParticipantPaymentCreateDto = {
  participantId: string;
  paymentMethod: PaymentMethod;
  value: Decimal;
};

export type OnSiteParticipantPaymentWithDto = {
  id: string;
  participantId: string;
  paymentMethod: PaymentMethod;
  value: Decimal;
  createdAt: Date;
};

export class OnSiteParticipantPayment extends Entity {
  private constructor(
    id: string,
    private participantId: string,
    private paymentMethod: PaymentMethod,
    private value: Decimal,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    participantId,
    paymentMethod,
    value,
  }: OnSiteParticipantPaymentCreateDto): OnSiteParticipantPayment {
    const id = Utils.generateUUID();
    const createdAt = new Date();

    return new OnSiteParticipantPayment(
      id,
      participantId,
      paymentMethod,
      value,
      createdAt,
    );
  }

  public static with({
    id,
    participantId,
    paymentMethod,
    value,
    createdAt,
  }: OnSiteParticipantPaymentWithDto): OnSiteParticipantPayment {
    return new OnSiteParticipantPayment(
      id,
      participantId,
      paymentMethod,
      value,
      createdAt,
    );
  }

  protected validate(): void {
    if (!this.participantId) {
      throw new Error('O ID do participante é obrigatório.');
    }

    if (!this.paymentMethod) {
      throw new Error('O método de pagamento é obrigatório.');
    }

    if (!this.value || this.value.lessThanOrEqualTo(0)) {
      throw new Error('O valor deve ser maior que zero.');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getParticipantId(): string {
    return this.participantId;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getValue(): Decimal {
    return this.value;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
