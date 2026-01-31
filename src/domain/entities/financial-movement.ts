import Decimal from 'decimal.js';
import { TransactionType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { FinancialMovementValidatorFactory } from '../factories/financial-moviment/financial-moviment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type FinancialMovementCreateDto = {
  eventId: string;
  accountId?: string;
  guestEmail?: string;
  inscriptionId?: string;
  type: TransactionType;
  value: Decimal;
};

export type FinancialMovementWithDto = {
  id: string;
  eventId: string;
  accountId?: string;
  guestEmail?: string;
  inscriptionId?: string;
  type: TransactionType;
  value: Decimal;
  createdAt: Date;
  updatedAt: Date;
};

export class FinancialMovement extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private type: TransactionType,
    private value: Decimal,
    createdAt: Date,
    updatedAt: Date,
    private accountId?: string,
    private guestEmail?: string,
    private inscriptionId?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    accountId,
    guestEmail,
    inscriptionId,
    type,
    value,
  }: FinancialMovementCreateDto) {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    guestEmail = guestEmail || undefined;
    inscriptionId = inscriptionId || undefined;

    return new FinancialMovement(
      id,
      eventId,
      type,
      value,
      createdAt,
      updatedAt,
      accountId,
      guestEmail,
      inscriptionId,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    guestEmail,
    inscriptionId,
    type,
    value,
    createdAt,
    updatedAt,
  }: FinancialMovementWithDto) {
    return new FinancialMovement(
      id,
      eventId,
      type,
      value,
      createdAt,
      updatedAt,
      accountId,
      guestEmail,
      inscriptionId,
    );
  }

  // Validação da entidade
  protected validate(): void {
    FinancialMovementValidatorFactory.create().validate(this);
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getAccountId(): string | undefined {
    return this.accountId;
  }

  public getGuestEmail(): string | undefined {
    return this.guestEmail;
  }

  public getInscriptionId(): string | undefined {
    return this.inscriptionId;
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
