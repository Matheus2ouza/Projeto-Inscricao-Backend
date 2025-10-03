import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type EventCreateDto = {
  name: string;
  date: Date;
  regionId: string;
};

export type EventWithDto = {
  id: string;
  name: string;
  date: Date;
  regionId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Event extends Entity {
  private constructor(
    id: string,
    private name: string,
    private date: Date,
    private regionId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({ name, date, regionId }: EventCreateDto): Event {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Event(id, name, date, regionId, createdAt, updatedAt);
  }

  public static with({
    id,
    name,
    date,
    regionId,
    createdAt,
    updatedAt,
  }: EventWithDto): Event {
    return new Event(id, name, date, regionId, createdAt, updatedAt);
  }

  protected validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Nome do evento é obrigatório');
    }
    if (!this.date) {
      throw new Error('Data do evento é obrigatória');
    }
    if (!this.regionId || this.regionId.trim().length === 0) {
      throw new Error('ID da região é obrigatório');
    }
  }

  public getName(): string {
    return this.name;
  }

  public getDate(): Date {
    return this.date;
  }

  public getRegionId(): string {
    return this.regionId;
  }
}
