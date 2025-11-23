import { PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketSalePaymentCreateDto = {
  ticketSaleId: string;
  paymentMethod: PaymentMethod;
  value: number;
};

export type TicketSalePaymentWithDto = {
  id: string;
  ticketSaleId: string;
  paymentMethod: PaymentMethod;
  value: number;
  createdAt: Date;
};

export class TicketSalePayment extends Entity {
  private constructor(
    id: string,
    private ticketSaleId: string,
    private paymentMethod: PaymentMethod,
    private value: number,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    ticketSaleId,
    paymentMethod,
    value,
  }: TicketSalePaymentCreateDto): TicketSalePayment {
    const id = Utils.generateUUID();
    const createdAt = new Date();

    return new TicketSalePayment(
      id,
      ticketSaleId,
      paymentMethod,
      value,
      createdAt,
    );
  }

  public static with({
    id,
    ticketSaleId,
    paymentMethod,
    value,
    createdAt,
  }: TicketSalePaymentWithDto): TicketSalePayment {
    return new TicketSalePayment(
      id,
      ticketSaleId,
      paymentMethod,
      value,
      createdAt,
    );
  }

  protected validate(): void {
    if (!this.ticketSaleId) {
      throw new Error('O ID da venda do ticket é obrigatório.');
    }

    if (!this.paymentMethod) {
      throw new Error('O método de pagamento é obrigatório.');
    }

    if (this.value <= 0) {
      throw new Error('O valor do pagamento deve ser maior que zero.');
    }
  }

  public getTicketSaleId(): string {
    return this.ticketSaleId;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getValue(): number {
    return this.value;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
