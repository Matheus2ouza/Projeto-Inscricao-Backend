import { InscriptionStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { InscriptionValidatorFactory } from '../factories/inscription/inscription.validator.factory';
import { Entity } from '../shared/entities/entity';

export type InscriptionCreateDto = {
  accountId: string;
  eventId: string;
  responsible: string;
  email?: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
};

export type InscriptionWithDto = {
  id: string;
  accountId: string;
  eventId: string;
  responsible: string;
  email?: string;
  phone: string;
  totalValue: number;
  totalPaid: number;
  status: InscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class Inscription extends Entity {
  private constructor(
    id: string,
    private accountId: string,
    private eventId: string,
    private responsible: string,
    private phone: string,
    private totalValue: number,
    private totalPaid: number,
    private status: InscriptionStatus,
    createdAt: Date,
    updatedAt: Date,
    private email?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    accountId,
    eventId,
    responsible,
    phone,
    totalValue,
    status,
    email,
  }: InscriptionCreateDto): Inscription {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const totalPaid = 0;

    return new Inscription(
      id,
      accountId,
      eventId,
      responsible,
      phone,
      totalValue,
      totalPaid,
      status,
      createdAt,
      updatedAt,
      email,
    );
  }

  public static with({
    id,
    accountId,
    eventId,
    responsible,
    phone,
    totalValue,
    totalPaid,
    status,
    createdAt,
    updatedAt,
    email,
  }: InscriptionWithDto): Inscription {
    return new Inscription(
      id,
      accountId,
      eventId,
      responsible,
      phone,
      totalValue,
      totalPaid,
      status,
      createdAt,
      updatedAt,
      email,
    );
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getResponsible(): string {
    return this.responsible;
  }

  public getEmail(): string | undefined {
    return this.email;
  }

  public getPhone(): string {
    return this.phone;
  }

  public getTotalValue(): number {
    return this.totalValue;
  }

  public getTotalPaid(): number {
    return this.totalPaid;
  }

  public getStatus(): InscriptionStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected validate(): void {
    InscriptionValidatorFactory.create().validate(this);
  }

  public setResponsible(responsible: string): void {
    this.responsible = responsible;
    this.updatedAt = new Date();
    this.validate();
  }

  public setPhone(phone: string): void {
    this.phone = phone;
    this.updatedAt = new Date();
    this.validate();
  }

  public setEmail(email: string): void {
    this.email = email;
    this.updatedAt = new Date();
    this.validate();
  }

  public update({
    responsible,
    phone,
    email,
  }: {
    responsible?: string;
    phone?: string;
    email?: string;
  }): void {
    if (responsible !== undefined) {
      this.setResponsible(responsible);
    }
    if (phone !== undefined) {
      this.setPhone(phone);
    }
    if (email !== undefined) {
      this.setEmail(email);
    }
  }
}
