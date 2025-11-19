import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type TypesInscriptionDto = {
  description: string;
  value: number;
  eventId: string;
  specialtype: boolean;
};

export type TypesInscriptionWithDto = {
  id: string;
  description: string;
  value: number;
  eventId: string;
  specialtype: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class TypesInscription extends Entity {
  private constructor(
    id: string,
    private description: string,
    private value: number,
    private eventId: string,
    private specialtype: boolean,
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
    specialtype,
  }: TypesInscriptionDto): TypesInscription {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new TypesInscription(
      id,
      description,
      value,
      eventId,
      specialtype,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    description,
    value,
    eventId,
    specialtype,
    createdAt,
    updatedAt,
  }: TypesInscriptionWithDto): TypesInscription {
    return new TypesInscription(
      id,
      description,
      value,
      eventId,
      specialtype,
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

  public getSpecialType(): boolean {
    return this.specialtype;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public setDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
    this.validate();
  }

  public setValue(value: number): void {
    this.value = value;
    this.updatedAt = new Date();
    this.validate();
  }

  public setSpecialType(specialtype: boolean): void {
    this.specialtype = specialtype;
    this.updatedAt = new Date();
    this.validate();
  }

  public update({
    description,
    value,
    specialtype,
  }: {
    description: string;
    value: number;
    specialtype: boolean;
  }): void {
    if (!description !== undefined) {
      this.setDescription(description);
    }

    if (!value !== undefined) {
      this.setValue(value);
    }

    if (!specialtype !== undefined) {
      this.setSpecialType(specialtype);
    }
  }
}
