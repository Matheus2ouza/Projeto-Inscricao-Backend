import { Utils } from 'src/shared/utils/utils';
import { TypeInscriptionValidatorFactory } from '../factories/type-inscription/type-inscription.validator.factory';
import { Entity } from '../shared/entities/entity';

export type TypeInscriptionDto = {
  description: string;
  value: number;
  eventId: string;
  rule: Date | null;
  specialType: boolean;
};

export type TypeInscriptionWithDto = {
  id: string;
  description: string;
  value: number;
  eventId: string;
  rule: Date | null;
  specialType: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class TypeInscription extends Entity {
  private constructor(
    id: string,
    private description: string,
    private value: number,
    private rule: Date | null,
    private eventId: string,
    private specialType: boolean,
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
    rule,
    specialType,
  }: TypeInscriptionDto): TypeInscription {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    // Ensure rule is a Date object or null
    if (typeof rule === 'string') {
      rule = new Date(rule);
    }
    rule = rule || null;

    return new TypeInscription(
      id,
      description,
      value,
      rule,
      eventId,
      specialType,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    description,
    value,
    eventId,
    rule,
    specialType,
    createdAt,
    updatedAt,
  }: TypeInscriptionWithDto): TypeInscription {
    return new TypeInscription(
      id,
      description,
      value,
      rule,
      eventId,
      specialType,
      createdAt,
      updatedAt,
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

  public getRule(): Date | null {
    return this.rule;
  }

  public getSpecialType(): boolean {
    return this.specialType;
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

  public setRule(rule: Date | null): void {
    this.rule = rule;
    this.updatedAt = new Date();
    this.validate();
  }

  public setSpecialType(specialType: boolean): void {
    this.specialType = specialType;
    this.updatedAt = new Date();
    this.validate();
  }

  public update({
    description,
    value,
    specialType,
  }: {
    description: string;
    value: number;
    specialType: boolean;
  }): void {
    if (!description !== undefined) {
      this.setDescription(description);
    }

    if (!value !== undefined) {
      this.setValue(value);
    }

    if (!specialType !== undefined) {
      this.setSpecialType(specialType);
    }
  }
}
