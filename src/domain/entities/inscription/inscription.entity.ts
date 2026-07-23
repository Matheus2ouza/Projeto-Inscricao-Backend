import { InscriptionStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { InscriptionValidatorFactory } from '../../factories/inscription/inscription.validator.factory';
import { Entity } from '../../shared/entities/entity';

export type InscriptionCreateDto = {
  localityId: string;
  accountId?: string;
  eventId: string;
  responsible: string;
  guestEmail?: string;
  guestName?: string;
  isGuest?: boolean;
  email?: string;
  phone: string;
  totalValue?: number;
  totalPaid?: number;
  status?: InscriptionStatus;
  expiresAt?: Date;
  observation?: string;
  exclusiveLinkId?: string;
};

export type InscriptionWithDto = {
  id: string;
  localityId?: string;
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
  exclusiveLinkId?: string;
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
    private localityId?: string,
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
    private exclusiveLinkId?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  // Factory Methods

  public static create({
    localityId,
    accountId,
    eventId,
    guestEmail,
    guestName,
    isGuest,
    responsible,
    phone,
    totalValue,
    totalPaid,
    status,
    email,
    expiresAt,
    observation,
    exclusiveLinkId,
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

    const totalValueDefault = totalValue || 0;
    const statusDefault = status || InscriptionStatus.PENDING;

    return new Inscription(
      id,
      eventId,
      responsible,
      phone,
      totalValueDefault,
      totalPaid ?? 0,
      statusDefault,
      createdAt,
      updatedAt,
      localityId,
      accountId,
      email,
      accessToken,
      confirmationCode,
      guestEmail,
      guestName,
      undefined,
      isGuest,
      expiresAt,
      undefined,
      observation,
      exclusiveLinkId,
    );
  }

  public static with({
    id,
    localityId,
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
    exclusiveLinkId,
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
      localityId,
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
      exclusiveLinkId,
    );
  }

  protected validate(): void {
    InscriptionValidatorFactory.create().validate(this);
  }

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  // Getters

  public getLocalityId(): string | undefined {
    return this.localityId;
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

  public getExclusiveLinkId(): string | undefined {
    return this.exclusiveLinkId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ─── Setters ──────────────────────────────────────────────────────────────────

  public setLocalityId(localityId: string): void {
    this.localityId = localityId;
    this.touch();
  }

  public setStatus(status: InscriptionStatus): void {
    this.status = status;
    this.touch();
  }

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

  public setTotalValue(totalValue: number): void {
    this.totalValue = totalValue;
    this.touch();
  }

  // ─── Domain Actions ───────────────────────────────────────────────────────────

  public update({
    localityId,
    guestEmail,
    guestName,
    responsible,
    phone,
    email,
    observation,
  }: {
    localityId?: string;
    guestEmail?: string;
    guestName?: string;
    responsible?: string;
    phone?: string;
    email?: string;
    observation?: string;
  }): void {
    if (localityId !== undefined) this.localityId = localityId;
    if (guestEmail !== undefined) this.guestEmail = guestEmail;
    if (guestName !== undefined) this.guestName = guestName;
    if (responsible !== undefined) this.setResponsible(responsible);
    if (phone !== undefined) this.setPhone(phone);
    if (email !== undefined) this.setEmail(email);
    if (observation !== undefined) this.setObservation(observation);

    this.touch();
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

  public incrementeTotalValue(value: number): void {
    this.totalValue += value;
    this.touch();
  }

  public decrementTotalValue(value: number): void {
    this.totalValue -= value;
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
}
