import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type EventTicketCreateDto = {
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  expirationDate: Date;
  isActive: boolean;
};

export type EventTicketWithDto = {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  available: number;
  expirationDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class EventTicket extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private name: string,
    private description: string | undefined,
    private quantity: number,
    private price: number,
    private available: number,
    private expirationDate: Date,
    private isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    name,
    description,
    quantity,
    price,
    expirationDate,
    isActive,
  }: EventTicketCreateDto): EventTicket {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const available = quantity;

    return new EventTicket(
      id,
      eventId,
      name,
      description,
      quantity,
      price,
      available,
      expirationDate,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    eventId,
    name,
    description,
    quantity,
    price,
    available,
    expirationDate,
    isActive,
    createdAt,
    updatedAt,
  }: EventTicketWithDto): EventTicket {
    return new EventTicket(
      id,
      eventId,
      name,
      description,
      quantity,
      price,
      available,
      expirationDate,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('O nome do ticket é obrigatório');
    }
    if (this.quantity <= 0) {
      throw new Error('A quantidade de tickets deve ser maior que zero');
    }
    if (this.price < 0) {
      throw new Error('O valor do ticket não pode ser negativo');
    }
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getAvailable(): number {
    return this.available;
  }

  public getPrice(): number {
    return this.price;
  }

  public getExpirationDate(): Date {
    return this.expirationDate;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
