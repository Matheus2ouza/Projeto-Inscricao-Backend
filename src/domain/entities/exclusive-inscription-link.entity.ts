import { Utils } from 'src/shared/utils/utils';
import { ExclusiveInscriptionLinkValidatorFactory } from '../factories/exclusive-inscription-link/exclusive-inscription-link.factory';
import { Entity } from '../shared/entities/entity';

export type ExclusiveInscriptionLinkCreateDto = {
  eventId: string;
  name: string;
  createdBy: string;
  expiresAt: Date;
};

export type ExclusiveInscriptionLinkWithDto = {
  id: string;
  eventId: string;
  name: string;
  token: string;
  expiresAt: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ExclusiveInscriptionLink extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private name: string,
    private token: string,
    private expiresAt: Date,
    private active: boolean,
    private createdBy: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  // Factory Methods

  protected validate(): void {
    ExclusiveInscriptionLinkValidatorFactory.create().validate(this);
  }

  public static create({
    eventId,
    name,
    createdBy,
    expiresAt,
  }: ExclusiveInscriptionLinkCreateDto): ExclusiveInscriptionLink {
    const id = Utils.generateUUID();
    const token = Utils.generateUUID();
    const active = true;
    const createdAt = new Date();
    const updatedAt = new Date();

    return new ExclusiveInscriptionLink(
      id,
      eventId,
      name,
      token,
      expiresAt,
      active,
      createdBy,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    eventId,
    name,
    token,
    expiresAt,
    active,
    createdBy,
    createdAt,
    updatedAt,
  }: ExclusiveInscriptionLinkWithDto): ExclusiveInscriptionLink {
    return new ExclusiveInscriptionLink(
      id,
      eventId,
      name,
      token,
      expiresAt,
      active,
      createdBy,
      createdAt,
      updatedAt,
    );
  }

  public getId(): string {
    return this.id;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getName(): string {
    return this.name;
  }

  public getToken(): string {
    return this.token;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getActive(): boolean {
    return this.active;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
