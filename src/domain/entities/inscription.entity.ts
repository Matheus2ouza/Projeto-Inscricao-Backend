import { InscriptionStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { InscriptionValidatorFactory } from '../factories/inscription/inscription.validator.factory';
import { Entity } from '../shared/entities/entity';

export type InscriptionCreateDto = {
  accountId?: string;
  eventId: string;
  responsible: string;
  guestEmail?: string;
  guestName?: string;
  guestLocality?: string;
  isGuest?: boolean;
  email?: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
};

export type InscriptionWithDto = {
  id: string;
  accountId?: string;
  eventId: string;
  accessToken?: string;
  confirmationCode?: string;
  guestEmail?: string;
  guestName?: string;
  guestLocality?: string;
  isGuest?: boolean;
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

    private eventId: string,
    private responsible: string,
    private phone: string,
    private totalValue: number,
    private totalPaid: number,
    private status: InscriptionStatus,
    createdAt: Date,
    updatedAt: Date,
    private accountId?: string,
    private email?: string,
    private accessToken?: string,
    private confirmationCode?: string,
    private guestEmail?: string,
    private guestName?: string,
    private guestLocality?: string,
    private isGuest?: boolean,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    accountId,
    eventId,
    guestEmail,
    guestName,
    guestLocality,
    isGuest,
    responsible,
    phone,
    totalValue,
    status,
    email,
  }: InscriptionCreateDto): Inscription {
    //com a adição do guest a relação com o account se tornou opcional
    accountId = accountId || undefined;

    //Dados do guest
    guestEmail = guestEmail || undefined;
    guestName = guestName || undefined;
    guestLocality = guestLocality || undefined;
    isGuest = isGuest || false;

    // Se for convidado, gerar token de acesso e código de confirmação
    let accessToken: string | undefined = undefined;
    let confirmationCode: string | undefined = undefined;
    if (isGuest) {
      accessToken = Utils.generateUUID();
      confirmationCode = Utils.generateConfirmationCode();
    } else {
      accessToken = undefined;
      confirmationCode = undefined;
    }
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const totalPaid = 0;

    return new Inscription(
      id,
      eventId,
      responsible,
      phone,
      totalValue,
      totalPaid,
      status,
      createdAt,
      updatedAt,
      accountId,
      email,
      accessToken,
      confirmationCode,
      guestEmail,
      guestName,
      guestLocality,
      isGuest,
    );
  }

  public static with({
    id,
    accountId,
    eventId,
    accessToken,
    confirmationCode,
    guestEmail,
    guestName,
    guestLocality,
    isGuest,
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
      eventId,
      responsible,
      phone,
      totalValue,
      totalPaid,
      status,
      createdAt,
      updatedAt,
      accountId,
      email,
      accessToken,
      confirmationCode,
      guestEmail,
      guestName,
      guestLocality,
      isGuest,
    );
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getAccountId(): string | undefined {
    return this.accountId;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getAccessToken(): string | undefined {
    return this.accessToken;
  }

  public getConfirmationCode(): string | undefined {
    return this.confirmationCode;
  }

  public getGuestEmail(): string | undefined {
    return this.guestEmail;
  }

  public getGuestName(): string | undefined {
    return this.guestName;
  }

  public getGuestLocality(): string | undefined {
    return this.guestLocality;
  }

  public getIsGuest(): boolean {
    return this.isGuest || false;
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

  public inscriptionPaid(): void {
    this.status = InscriptionStatus.PAID;
    this.updatedAt = new Date();
    this.validate();
  }

  public inscriptionUnpaid(): void {
    this.status = InscriptionStatus.PENDING;
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

  public decrementTotalPaid(value: number): void {
    this.totalPaid -= value;
    this.updatedAt = new Date();
    this.validate();
  }
}
