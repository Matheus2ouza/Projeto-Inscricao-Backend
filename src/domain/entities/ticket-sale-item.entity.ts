import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketSaleItemCreateDto = {
  ticketSaleId: string;
  ticketId: string;
  quantity: number;
  pricePerTicket: number;
  totalValue: number;
};

export type TicketSaleItemWithDto = {
  id: string;
  ticketSaleId: string;
  ticketId: string;
  quantity: number;
  pricePerTicket: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
};

export class TicketSaleItem extends Entity {
  private constructor(
    id: string,
    private ticketSaleId: string,
    private ticketId: string,
    private quantity: number,
    private pricePerTicket: number,
    private totalValue: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    ticketSaleId,
    ticketId,
    quantity,
    pricePerTicket,
    totalValue,
  }: TicketSaleItemCreateDto): TicketSaleItem {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    return new TicketSaleItem(
      id,
      ticketSaleId,
      ticketId,
      quantity,
      pricePerTicket,
      totalValue,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    ticketSaleId,
    ticketId,
    quantity,
    pricePerTicket,
    totalValue,
    createdAt,
    updatedAt,
  }: TicketSaleItemWithDto): TicketSaleItem {
    return new TicketSaleItem(
      id,
      ticketSaleId,
      ticketId,
      quantity,
      pricePerTicket,
      totalValue,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    if (!this.ticketSaleId) {
      throw new Error('O ID da venda de ticket é obrigatório');
    }
    if (!this.ticketId) {
      throw new Error('O ID do ticket é obrigatório');
    }
    if (this.quantity <= 0) {
      throw new Error('A quantidade de tickets deve ser maior que zero');
    }
    if (this.pricePerTicket < 0) {
      throw new Error('O preço por ticket não pode ser negativo');
    }
    if (this.totalValue < 0) {
      throw new Error('O valor total não pode ser negativo');
    }
  }

  public getTicketSaleId(): string {
    return this.ticketSaleId;
  }

  public getTicketId(): string {
    return this.ticketId;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getPricePerTicket(): number {
    return this.pricePerTicket;
  }

  public getTotalValue(): number {
    return this.totalValue;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
