import { Utils } from 'src/shared/utils/utils';
import { TypeInscriptionValidatorFactory } from '../factories/type-inscription/type-inscription.validator.factory';
import { Entity } from '../shared/entities/entity';

export type TypeInscriptionDto = {
  description: string;
  value: number;
  eventId: string;
  rule?: Date;
  specialtype: boolean;
};

export type TypeInscriptionWithDto = {
  id: string;
  description: string;
  value: number;
  eventId: string;
  rule?: Date;
  specialtype: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class TypeInscription extends Entity {
  private constructor(
    id: string,
    private description: string,
    private value: number,
    private eventId: string,
    private specialtype: boolean,
    createdAt: Date,
    updatedAt: Date,
    private rule?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    description,
    value,
    eventId,
    rule,
    specialtype,
  }: TypeInscriptionDto): TypeInscription {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    rule = rule || undefined;

    return new TypeInscription(
      id,
      description,
      value,
      eventId,
      specialtype,
      createdAt,
      updatedAt,
      rule,
    );
  }

  public static with({
    id,
    description,
    value,
    eventId,
    rule,
    specialtype,
    createdAt,
    updatedAt,
  }: TypeInscriptionWithDto): TypeInscription {
    return new TypeInscription(
      id,
      description,
      value,
      eventId,
      specialtype,
      createdAt,
      updatedAt,
      rule,
    );
  }

  protected validate(): void {
    TypeInscriptionValidatorFactory.create().validate(this);
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

  public getRule(): Date | undefined {
    return this.rule;
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
