import { Utils } from 'src/shared/utils/utils';
import { CashRegisterEventValidatorFactory } from '../factories/cash-register-event/cash-register-event.validator.factory';
import { Entity } from '../shared/entities/entity';

export type CashRegisterEventCreateDto = {
  cashRegisterId: string;
  eventId: string;
};

export type CashRegisterEventWithDto = {
  id: string;
  cashRegisterId: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class CashRegisterEvent extends Entity {
  constructor(
    id: string,
    private cashRegisterId: string,
    private eventId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    cashRegisterId,
    eventId,
  }: CashRegisterEventCreateDto): CashRegisterEvent {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new CashRegisterEvent(id, cashRegisterId, eventId, createdAt, updatedAt);
  }

  public static with({
    id,
    cashRegisterId,
    eventId,
    createdAt,
    updatedAt,
  }: CashRegisterEventWithDto): CashRegisterEvent {
    return new CashRegisterEvent(id, cashRegisterId, eventId, createdAt, updatedAt);
  }

  public getId(): string {
    return this.id;
  }

  public getCashRegisterId(): string {
    return this.cashRegisterId;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected validate(): void {
    CashRegisterEventValidatorFactory.create().validate(this);
  }
}
