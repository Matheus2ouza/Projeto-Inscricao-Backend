import { CategoryExpense, PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { EventExpensesValidatorFactory } from '../factories/event-expenses/event-expenses.validator.factory';
import { Entity } from '../shared/entities/entity';

export type EventExpensesCreateDto = {
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  imageUrls?: string[];
  createdAt?: Date;
};

export type EventExpensesUpdateDto = {
  description?: string;
  value?: number;
  paymentMethod?: PaymentMethod;
  responsible?: string;
  category?: CategoryExpense;
  createdAt?: Date;
};

export type EventExpensesWithDto = {
  id: string;
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  imageUrls: string[];
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
    private category: CategoryExpense,
    private imageUrls: string[] = [],
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
    category,
    imageUrls,
    createdAt,
  }: EventExpensesCreateDto): EventExpenses {
    const id = Utils.generateUUID();

    const createdAtDefault = createdAt ?? new Date();

    const updatedAt = new Date();

    const imagesDefault = imageUrls ?? [];

    return new EventExpenses(
      id,
      eventId,
      description,
      value,
      paymentMethod,
      responsible,
      category,
      imagesDefault,
      createdAtDefault,
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
    category,
    imageUrls,
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
      category,
      imageUrls,
      createdAt,
      updatedAt,
    );
  }

  // Getters
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

  public getCategory(): CategoryExpense {
    return this.category;
  }

  public getImageUrls(): string[] {
    return this.imageUrls;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected validate(): void {
    EventExpensesValidatorFactory.create().validate(this);
  }

  public update({
    description,
    value,
    paymentMethod,
    responsible,
    category,
    createdAt,
  }: EventExpensesUpdateDto): void {
    if (description !== undefined) {
      this.description = description;
    }

    if (value !== undefined) {
      this.value = value;
    }

    if (paymentMethod !== undefined) {
      this.paymentMethod = paymentMethod;
    }

    if (responsible !== undefined) {
      this.responsible = responsible;
    }

    if (category !== undefined) {
      this.category = category;
    }

    if (createdAt !== undefined) {
      this.createdAt = createdAt;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  public addImageUrls(urls: string[]): void {
    this.imageUrls = [...this.imageUrls, ...urls];
    this.updatedAt = new Date();
    this.validate();
  }

  public removeImageUrl(index: number): void {
    this.imageUrls.splice(index, 1);
    this.updatedAt = new Date();
    this.validate();
  }
}
