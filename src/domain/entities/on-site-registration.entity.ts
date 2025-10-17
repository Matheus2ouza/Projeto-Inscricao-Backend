import Decimal from 'decimal.js';
import { InscriptionStatus, PaymentMethod } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type OnSiteRegistrationCreateDto = {
  eventId: string;
  accountId: string;
  responsible: string;
  phone: string;
  totalValue: Decimal;
  status: InscriptionStatus;
  paymentMethod: PaymentMethod;
};

export type OnSiteRegistrationwithDto = {
  id: string;
  eventId: string;
  accountId: string;
  responsible: string;
  phone: string;
  paymentMethod: PaymentMethod;
  totalValue: Decimal;
  status: InscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class OnSiteRegistration extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private accountId: string,
    private responsible: string,
    private phone: string,
    private paymentMethod: PaymentMethod,
    private totalValue: Decimal,
    private status: InscriptionStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    accountId,
    responsible,
    phone,
    paymentMethod,
    totalValue,
    status,
  }: OnSiteRegistrationCreateDto): OnSiteRegistration {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new OnSiteRegistration(
      id,
      eventId,
      accountId,
      responsible,
      phone,
      paymentMethod,
      totalValue,
      status,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    responsible,
    phone,
    paymentMethod,
    totalValue,
    status,
    createdAt,
    updatedAt,
  }: OnSiteRegistrationwithDto): OnSiteRegistration {
    return new OnSiteRegistration(
      id,
      eventId,
      accountId,
      responsible,
      phone,
      paymentMethod,
      totalValue,
      status,
      createdAt,
      updatedAt,
    );
  }

  public validate(): void {
    if (!this.accountId) {
      throw new Error('Id do Usuário é obrigatório');
    }

    if (!this.eventId) {
      throw new Error('Id do Evento é obrigatório');
    }

    if (!this.responsible || this.responsible.trim().length === 0) {
      throw new Error('O nome do responsável é obrigatório');
    }

    if (!this.phone || this.phone.trim().length === 0) {
      throw new Error('O telefone do responsável é obrigatório');
    }

    if (!this.status) {
      throw new Error('O status é obrigatório');
    }
  }

  // ============
  // 🔹 GETTERS
  // ============

  public getId(): string {
    return this.id;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getResponsible(): string {
    return this.responsible;
  }

  public getPhone(): string {
    return this.phone;
  }

  public getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  public getTotalValue(): Decimal {
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
}
