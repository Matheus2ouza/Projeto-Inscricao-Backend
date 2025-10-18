import { PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketSaleCreateDto = {
  ticketId: string;
  accountId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  pricePerTicket: number;
};

export type TicketSaleWithDto = {
  id: string;
  ticketId: string;
  accountId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
};

export class TicketSale extends Entity {
  private constructor(
    id: string,
    private ticketId: string,
    private accountId: string,
    private quantity: number,
    private paymentMethod: PaymentMethod,
    private totalValue: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    ticketId,
    accountId,
    quantity,
    paymentMethod,
    pricePerTicket,
  }: TicketSaleCreateDto): TicketSale {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    const totalValue = quantity * pricePerTicket;

    return new TicketSale(
      id,
      ticketId,
      accountId,
      quantity,
      paymentMethod,
      totalValue,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    ticketId,
    accountId,
    quantity,
    paymentMethod,
    totalValue,
    createdAt,
    updatedAt,
  }: TicketSaleWithDto): TicketSale {
    return new TicketSale(
      id,
      ticketId,
      accountId,
      quantity,
      paymentMethod,
      totalValue,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    if (this.quantity <= 0) {
      throw new Error('A quantidade de tickets deve ser maior que zero');
    }
    if (this.totalValue < 0) {
      throw new Error('O valor total não pode ser negativo');
    }
  }

  public getTicketId(): string {
    return this.ticketId;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getTotalValue(): number {
    return this.totalValue;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdateAt(): Date {
    return this.updatedAt;
  }
}
