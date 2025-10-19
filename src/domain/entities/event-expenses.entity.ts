import { PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type EventExpensesCreateDto = {
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
};

export type EventExpensesWithDto = {
  id: string;
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  createdAt: Date;
  updatedAt: Date;
};

export class EventExpenses extends Entity {
  public constructor(
    id: string,
    private eventId: string,
    private description: string,
    private value: number,
    private paymentMethod: PaymentMethod,
    private responsible: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    description,
    value,
    paymentMethod,
    responsible,
  }: EventExpensesCreateDto): EventExpenses {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new EventExpenses(
      id,
      eventId,
      description,
      value,
      paymentMethod,
      responsible,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    eventId,
    description,
    value,
    paymentMethod,
    responsible,
    createdAt,
    updatedAt,
  }: EventExpensesWithDto): EventExpenses {
    return new EventExpenses(
      id,
      eventId,
      description,
      value,
      paymentMethod,
      responsible,
      createdAt,
      updatedAt,
    );
  }

  // ✅ Getters básicos
  public getEventId(): string {
    return this.eventId;
  }

  public getDescription(): string {
    return this.description;
  }

  public getValue(): number {
    return this.value;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getResponsible(): string {
    return this.responsible;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected validate(): void {
    if (!this.eventId?.trim()) throw new Error('O ID do evento é obrigatório.');
    if (!this.description?.trim())
      throw new Error('A descrição do gasto é obrigatória.');
    if (this.value <= 0)
      throw new Error('O valor do gasto deve ser maior que zero.');
    if (!this.paymentMethod)
      throw new Error('O método de pagamento é obrigatório.');
    if (!this.responsible?.trim())
      throw new Error('O responsável pelo gasto é obrigatório.');
  }
}
