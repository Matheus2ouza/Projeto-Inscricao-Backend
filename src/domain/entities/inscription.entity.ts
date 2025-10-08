import { InscriptionStatus } from 'generated/prisma';
import { Entity } from '../shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';

export type InscriptionCreateDto = {
  accountId: string;
  eventId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
};

export type InscriptionWithDto = {
  id: string;
  accountId: string;
  eventId: string;
  responsible: string;
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

  // Setters/Update methods
  public updateResponsible(responsible: string): void {
    this.responsible = responsible;
    this.validate();
  }

  public updatePhone(phone: string): void {
    this.phone = phone;
    this.validate();
  }

  public updateTotalValue(totalValue: number): void {
    this.totalValue = totalValue;
    this.validate();
  }

  public updateStatus(status: InscriptionStatus): void {
    this.status = status;
    this.validate();
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

    if (!this.totalValue || this.totalValue <= 0) {
      throw new Error('O valor total tem que ser um valor maior que zero');
    }

    if (!this.status) {
      throw new Error('O Status é obrigatório');
    }
  }
}
