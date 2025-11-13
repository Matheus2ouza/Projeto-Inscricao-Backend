import { InscriptionStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
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

    return new Inscription(
      id,
      accountId,
      eventId,
      responsible,
      phone,
      totalValue,
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
    if (!this.accountId) {
      throw new Error('Id do Usuario é obrigatório');
    }

    if (!this.eventId) {
      throw new Error('Id do Evento é obrigatório');
    }

    if (!this.responsible || this.responsible.trim().length === 0) {
      throw new Error('O responsavel pela inscrição é obrigatório');
    }

    if (!this.phone || this.phone.trim().length === 0) {
      throw new Error('O telefone do responsavel pela inscrição é obrigatorio');
    }

    if (!this.status) {
      throw new Error('O Status é obrigatório');
    }
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
