import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TypesInscriptionDto = {
  description: string;
  value: number;
  eventId: string;
};

export type TypesInscriptionWithDto = {
  id: string;
  description: string;
  value: number;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class TypesInscription extends Entity {
  private constructor(
    id: string,
    private description: string,
    private value: number,
    private eventId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    description,
    value,
    eventId,
  }: TypesInscriptionDto): TypesInscription {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new TypesInscription(
      id,
      description,
      value,
      eventId,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    description,
    value,
    eventId,
    createdAt,
    updatedAt,
  }: TypesInscriptionWithDto): TypesInscription {
    return new TypesInscription(
      id,
      description,
      value,
      eventId,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Description is required');
    }
  }

  public getDescription(): string {
    return this.description;
  }

  public getValue(): number {
    return this.value;
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
}
