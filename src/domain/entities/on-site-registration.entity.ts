import Decimal from 'decimal.js';
import { InscriptionStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type OnSiteRegistrationCreateDto = {
  eventId: string;
  responsible: string;
  phone?: string; // ✅ agora opcional
  totalValue: Decimal;
  status: InscriptionStatus;
};

export type OnSiteRegistrationwithDto = {
  id: string;
  eventId: string;
  responsible: string;
  phone?: string;
  totalValue: Decimal;
  status: InscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export class OnSiteRegistration extends Entity {
  private constructor(
    id: string,
    private eventId: string,
    private responsible: string,
    private phone: string | undefined,
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
    responsible,
    phone,
    totalValue,
    status,
  }: OnSiteRegistrationCreateDto): OnSiteRegistration {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new OnSiteRegistration(
      id,
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
    eventId,
    responsible,
    phone,
    totalValue,
    status,
    createdAt,
    updatedAt,
  }: OnSiteRegistrationwithDto): OnSiteRegistration {
    return new OnSiteRegistration(
      id,
      eventId,
      responsible,
      phone,
      totalValue,
      status,
      createdAt,
      updatedAt,
    );
  }

  public validate(): void {
    if (!this.eventId) {
      throw new Error('Id do Evento é obrigatório');
    }

    if (!this.responsible || this.responsible.trim().length === 0) {
      throw new Error('O nome do responsável é obrigatório');
    }

    if (!this.status) {
      throw new Error('O status é obrigatório');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getResponsible(): string {
    return this.responsible;
  }

  public getPhone(): string | undefined {
    return this.phone;
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
