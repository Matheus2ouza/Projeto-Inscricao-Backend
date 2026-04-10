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
  totalPaid?: number;
  status: InscriptionStatus;
  expiresAt?: Date;
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
  expiresAt?: Date;
  cancelledAt?: Date;
  observation?: string;
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
    private expiresAt?: Date,
    private cancelledAt?: Date,
    private observation?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  // ─── Factory Methods ──────────────────────────────────────────────────────────

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
    totalPaid,
    status,
    email,
    expiresAt,
  }: InscriptionCreateDto): Inscription {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    let accessToken: string | undefined = undefined;
    let confirmationCode: string | undefined = undefined;

    if (isGuest) {
      accessToken = Utils.generateUUID();
      confirmationCode = Utils.generateConfirmationCode();
    }

    return new Inscription(
      id,
      eventId,
      responsible,
      phone,
      totalValue,
      totalPaid ?? 0,
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
      expiresAt,
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
    expiresAt,
    cancelledAt,
    createdAt,
    updatedAt,
    email,
    observation,
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
      expiresAt,
      cancelledAt,
      observation,
    );
  }

  // ─── Getters ──────────────────────────────────────────────────────────────────

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

  public getIsGuest(): boolean {
    return this.isGuest ?? false;
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

  public getExpiresAt(): Date | undefined {
    return this.expiresAt;
  }

  public getCancelledAt(): Date | undefined {
    return this.cancelledAt;
  }

  public getObservation(): string | undefined {
    return this.observation;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ─── Setters ──────────────────────────────────────────────────────────────────

  public setResponsible(responsible: string): void {
    this.responsible = responsible;
    this.touch();
  }

  public setPhone(phone: string): void {
    this.phone = phone;
    this.touch();
  }

  public setEmail(email: string): void {
    this.email = email;
    this.touch();
  }

  public setExpiresAt(expiresAt: Date): void {
    this.expiresAt = expiresAt;
    this.touch();
  }

  public setObservation(observation: string | undefined): void {
    this.observation = observation;
    this.touch();
  }

  // ─── Domain Actions ───────────────────────────────────────────────────────────

  public update({
    guestEmail,
    guestName,
    guestLocality,
    responsible,
    phone,
    email,
    observation,
  }: {
    guestEmail?: string;
    guestName?: string;
    guestLocality?: string;
    responsible?: string;
    phone?: string;
    email?: string;
    observation?: string;
  }): void {
    if (guestEmail !== undefined) this.guestEmail = guestEmail;
    if (guestName !== undefined) this.guestName = guestName;
    if (guestLocality !== undefined) this.guestLocality = guestLocality;
    if (responsible !== undefined) this.setResponsible(responsible);
    if (phone !== undefined) this.setPhone(phone);
    if (email !== undefined) this.setEmail(email);
    if (observation !== undefined) this.setObservation(observation);
  }

  public inscriptionPaid(): void {
    this.status = InscriptionStatus.PAID;
    this.touch();
  }

  public inscriptionUnpaid(): void {
    this.status = InscriptionStatus.PENDING;
    this.touch();
  }

  public markAsExpired(expiresAt: Date): void {
    this.cancelledAt = new Date(+expiresAt + 1000 * 60 * 60 * 24);
    this.status = InscriptionStatus.EXPIRED;
    this.touch();
  }

  public removeExpires(): void {
    this.cancelledAt = undefined;
    this.status = InscriptionStatus.PENDING;
    this.touch();
  }

  public incrementeValuePaid(value: number): void {
    this.totalPaid += value;
    this.touch();
  }

  public decrementTotalPaid(value: number): void {
    this.totalPaid -= value;
    this.touch();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  protected validate(): void {
    InscriptionValidatorFactory.create().validate(this);
  }
}
