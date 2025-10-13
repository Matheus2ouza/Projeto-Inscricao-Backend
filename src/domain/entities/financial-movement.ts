import Decimal from 'decimal.js';
import { TransactionType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type FinancialMovementCreateDto = {
  eventId: string;
  accountId: string;
  type: TransactionType;
  value: Decimal;
};

export type FinancialMovementWithDto = {
  id: string;
  eventId: string;
  accountId: string;
  type: TransactionType;
  value: Decimal;
  createdAt: Date;
  updatedAt: Date;
};

export class FinancialMovement extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private accountId: string,
    private type: TransactionType,
    private value: Decimal,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    accountId,
    type,
    value,
  }: FinancialMovementCreateDto) {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new FinancialMovement(
      id,
      eventId,
      accountId,
      type,
      value,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    type,
    value,
    createdAt,
    updatedAt,
  }: FinancialMovementWithDto) {
    return new FinancialMovement(
      id,
      eventId,
      accountId,
      type,
      value,
      createdAt,
      updatedAt,
    );
  }

  // Validação da entidade
  protected validate(): void {
    if (Number(this.value) <= 0) {
      throw new Error(
        'O valor da movimentação financeira deve ser maior que zero.',
      );
    }
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getType(): TransactionType {
    return this.type;
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
