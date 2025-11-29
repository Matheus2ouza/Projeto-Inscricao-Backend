import { TicketSaleStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TicketSaleCreateDto = {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  status: TicketSaleStatus;
  totalValue: number;
};

export type TicketSaleWithDto = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  status: TicketSaleStatus;
  totalValue: number;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class TicketSale extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private name: string,
    private email: string,
    private status: TicketSaleStatus,
    private totalValue: number,
    createdAt: Date,
    updatedAt: Date,
    private phone?: string,
    private approvedBy?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    name,
    email,
    phone,
    status,
    totalValue,
  }: TicketSaleCreateDto): TicketSale {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new TicketSale(
      id,
      eventId,
      name,
      email,
      status,
      totalValue,
      createdAt,
      updatedAt,
      phone,
    );
  }

  public static with({
    id,
    eventId,
    name,
    email,
    status,
    totalValue,
    createdAt,
    updatedAt,
    phone,
    approvedBy,
  }: TicketSaleWithDto): TicketSale {
    return new TicketSale(
      id,
      eventId,
      name,
      email,
      status,
      totalValue,
      createdAt,
      updatedAt,
      phone,
      approvedBy,
    );
  }

  protected validate(): void {
    if (!this.eventId) {
      throw new Error('O ID do evento é obrigatório');
    }
    if (!this.name) {
      throw new Error('O nome é obrigatório');
    }
    if (!this.email) {
      throw new Error('O email é obrigatório');
    }
    if (this.totalValue <= 0) {
      throw new Error('O valor total deve ser maior que zero');
    }
    if (this.totalValue < 0) {
      throw new Error('O valor total não pode ser negativo');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPhone(): string | undefined {
    return this.phone;
  }

  public getStatus(): TicketSaleStatus {
    return this.status;
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

  public getApprovedBy(): string | undefined {
    return this.approvedBy;
  }

  public approve(approvedBy: string): void {
    this.status = TicketSaleStatus.PAID;
    this.updatedAt = new Date();
    this.approvedBy = approvedBy;
  }

  public reject(): void {
    this.status = TicketSaleStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public payTicket(): void {
    this.status = TicketSaleStatus.UNDER_REVIEW;
    this.updatedAt = new Date();
  }
}
