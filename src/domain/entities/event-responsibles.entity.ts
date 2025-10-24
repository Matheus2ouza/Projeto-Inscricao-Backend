import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type EventResponsibleCreateDto = {
  eventId: string;
  accountId: string;
};

export type EventResponsibleWithDto = {
  id: string;
  eventId: string;
  accountId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class EventResponsible extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private accountId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    accountId,
  }: EventResponsibleCreateDto): EventResponsible {
    const id = Utils.generateUUID();
    const now = new Date();

    return new EventResponsible(id, eventId, accountId, now, now);
  }

  public static with({
    id,
    eventId,
    accountId,
    createdAt,
    updatedAt,
  }: EventResponsibleWithDto): EventResponsible {
    const created = createdAt ?? new Date();
    const updated = updatedAt ?? new Date();
    return new EventResponsible(id, eventId, accountId, created, updated);
  }

  protected validate(): void {
    if (!this.eventId || this.eventId.trim().length === 0) {
      throw new Error('O id do evento é obrigatório');
    }

    if (!this.accountId || this.accountId.trim().length === 0) {
      throw new Error('O id da conta é obrigatório');
    }
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
