import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';
import { Utils } from 'src/shared/utils/utils';
import { EventValidatorFactory } from '../../factories/event/event.validator.factory';
import { Entity } from '../../shared/entities/entity';

const DEFAULT_PARTICIPANT_FIELDS_CONFIG: ParticipantFieldsConfig = {
  cpf: 'required',
  preferredName: 'optional',
  shirtSize: 'optional',
  shirtType: 'optional',
};

export type EventCreateDto = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  imageUrl?: string;
  logoUrl?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  allowedInscriptionModes: InscriptionMode[];
  allowedPaymentModes: PaymentMode[];
  paymentEnabled: boolean;
  ticketEnabled?: boolean;
  participantFieldsConfig?: ParticipantFieldsConfig;
};

export type EventWithDto = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  quantityParticipants: number;
  amountCollected: number;
  amountNetValueCollected: number;
  amountSpent: number;
  regionId: string;
  imageUrl?: string;
  logoUrl?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  allowedInscriptionModes: InscriptionMode[];
  allowedPaymentModes: PaymentMode[];
  paymentEnabled: boolean;
  participantFieldsConfig?: ParticipantFieldsConfig;
  ticketEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Event extends Entity {
  private constructor(
    id: string,
    private name: string,
    private startDate: Date,
    private endDate: Date,
    private quantityParticipants: number,
    private amountCollected: number,
    private amountNetValueCollected: number,
    private amountSpent: number,
    private regionId: string,
    createdAt: Date,
    updatedAt: Date,
    private status: statusEvent,
    private allowedInscriptionModes: InscriptionMode[],
    private allowedPaymentModes: PaymentMode[],
    private paymentEnabled: boolean,
    private ticketEnabled?: boolean,
    private imageUrl?: string,
    private logoUrl?: string,
    private location?: string,
    private longitude?: number | null,
    private latitude?: number | null,
    private participantFieldsConfig?: ParticipantFieldsConfig,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  // ==================== FACTORY METHODS ====================

  public static create({
    name,
    startDate,
    endDate,
    regionId,
    imageUrl,
    logoUrl,
    location,
    longitude,
    latitude,
    status,
    allowedInscriptionModes,
    allowedPaymentModes,
    paymentEnabled,
    ticketEnabled,
    participantFieldsConfig,
  }: EventCreateDto): Event {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Event(
      id,
      name,
      startDate,
      endDate,
      0, // quantityParticipants
      0, // amountCollected
      0, // amountNetValueCollected
      0, // amountSpent
      regionId,
      createdAt,
      updatedAt,
      status,
      allowedInscriptionModes,
      allowedPaymentModes,
      paymentEnabled,
      ticketEnabled,
      imageUrl,
      logoUrl,
      location,
      longitude,
      latitude,
      participantFieldsConfig,
    );
  }

  public static with({
    id,
    name,
    startDate,
    endDate,
    quantityParticipants,
    amountCollected,
    amountNetValueCollected,
    amountSpent,
    regionId,
    imageUrl,
    logoUrl,
    location,
    longitude,
    latitude,
    status,
    allowedInscriptionModes,
    allowedPaymentModes,
    paymentEnabled,
    ticketEnabled,
    participantFieldsConfig,
    createdAt,
    updatedAt,
  }: EventWithDto): Event {
    return new Event(
      id,
      name,
      startDate,
      endDate,
      quantityParticipants,
      amountCollected,
      amountNetValueCollected,
      amountSpent,
      regionId,
      createdAt,
      updatedAt,
      status,
      allowedInscriptionModes,
      allowedPaymentModes,
      paymentEnabled,
      ticketEnabled,
      imageUrl,
      logoUrl,
      location,
      longitude,
      latitude,
      participantFieldsConfig,
    );
  }

  // ==================== PRIVATE METHODS ====================

  protected validate(): void {
    EventValidatorFactory.create().validate(this);
  }

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  // ==================== GETTERS ====================

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public getQuantityParticipants(): number {
    return this.quantityParticipants;
  }

  public getAmountCollected(): number {
    return this.amountCollected;
  }

  public getAmountNetValueCollected(): number {
    return this.amountNetValueCollected;
  }

  public getAmountSpent(): number {
    return this.amountSpent;
  }

  public getRegionId(): string {
    return this.regionId;
  }

  public getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  public getLogoUrl(): string | undefined {
    return this.logoUrl;
  }

  public getLocation(): string | undefined {
    return this.location;
  }

  public getLongitude(): number | undefined | null {
    return this.longitude;
  }

  public getLatitude(): number | undefined | null {
    return this.latitude;
  }

  public getStatus(): statusEvent {
    return this.status;
  }

  public getAllowedInscriptionModes(): InscriptionMode[] {
    return this.allowedInscriptionModes;
  }

  public getAllowedPaymentModes(): PaymentMode[] {
    return this.allowedPaymentModes;
  }

  public getPaymentEnabled(): boolean {
    return this.paymentEnabled;
  }

  public getTicketEnabled(): boolean | undefined {
    return this.ticketEnabled;
  }

  public getParticipantFieldsConfig(): ParticipantFieldsConfig {
    return {
      ...DEFAULT_PARTICIPANT_FIELDS_CONFIG,
      ...this.participantFieldsConfig,
    };
  }

  // ==================== SETTERS ====================

  public setName(name: string): void {
    this.name = name;
    this.touch();
  }

  public setStartDate(startDate: Date): void {
    this.startDate = startDate;
    this.touch();
  }

  public setEndDate(endDate: Date): void {
    this.endDate = endDate;
    this.touch();
  }

  public setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.touch();
  }

  public setLogoUrl(logoUrl: string): void {
    if (!logoUrl || logoUrl.trim().length === 0) {
      throw new Error('logoUrl não pode ser vazio');
    }
    this.logoUrl = logoUrl;
    this.touch();
  }

  public setLocation(location?: string): void {
    this.location = location;
    this.touch();
  }

  public setLongitude(longitude?: number | null): void {
    this.longitude = longitude;
    this.touch();
  }

  public setLatitude(latitude?: number | null): void {
    this.latitude = latitude;
    this.touch();
  }

  public setAllowedInscriptionModes(modes: InscriptionMode[]): void {
    this.allowedInscriptionModes = modes;
    this.touch();
  }

  public setAllowedPaymentModes(modes: PaymentMode[]): void {
    this.allowedPaymentModes = modes;
    this.touch();
  }

  public setTicketEnabled(enabled: boolean): void {
    this.ticketEnabled = enabled;
    this.touch();
  }

  public setParticipantFieldsConfig(config: ParticipantFieldsConfig): void {
    this.participantFieldsConfig = config;
    this.touch();
  }

  // ==================== BUSINESS METHODS ====================

  public update({
    name,
    startDate,
    endDate,
    location,
    longitude,
    latitude,
    allowedInscriptionModes,
    allowedPaymentModes,
    participantFieldsConfig,
  }: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    longitude?: number | null;
    latitude?: number | null;
    allowedInscriptionModes?: InscriptionMode[];
    allowedPaymentModes?: PaymentMode[];
    participantFieldsConfig?: ParticipantFieldsConfig;
  }): void {
    if (name !== undefined) this.setName(name);
    if (startDate !== undefined) this.setStartDate(startDate);
    if (endDate !== undefined) this.setEndDate(endDate);
    if (location !== undefined) this.setLocation(location);
    if (longitude !== undefined) this.setLongitude(longitude);
    if (latitude !== undefined) this.setLatitude(latitude);
    if (allowedInscriptionModes !== undefined)
      this.setAllowedInscriptionModes(allowedInscriptionModes);
    if (allowedPaymentModes !== undefined)
      this.setAllowedPaymentModes(allowedPaymentModes);
    if (participantFieldsConfig !== undefined)
      this.setParticipantFieldsConfig(participantFieldsConfig);
    this.touch();
  }

  public openEvent(): void {
    this.status = 'OPEN';
    this.touch();
  }

  public closeEvent(): void {
    this.status = 'CLOSE';
    this.touch();
  }

  public addParticipant(): void {
    this.quantityParticipants += 1;
    this.touch();
  }

  public removeParticipant(): void {
    if (this.quantityParticipants > 0) {
      this.quantityParticipants -= 1;
      this.touch();
    }
  }

  public addParticipants(quantity: number): void {
    if (quantity < 0) throw new Error('Quantidade não pode ser negativa');
    this.quantityParticipants += quantity;
    this.touch();
  }

  public removeParticipants(quantity: number): void {
    if (quantity < 0) throw new Error('Quantidade não pode ser negativa');
    if (this.quantityParticipants < quantity) {
      throw new Error('Quantidade de participantes insuficiente');
    }
    this.quantityParticipants -= quantity;
    this.touch();
  }

  public addCollectedAmount(amount: number): void {
    if (amount < 0) throw new Error('Valor não pode ser negativo');
    this.amountCollected += amount;
    this.touch();
  }

  public removeCollectedAmount(amount: number): void {
    if (amount < 0) throw new Error('Valor não pode ser negativo');
    if (this.amountCollected < amount) {
      throw new Error('Valor coletado insuficiente');
    }
    this.amountCollected -= amount;
    this.touch();
  }

  public addNetValueCollected(amount: number): void {
    if (amount < 0) throw new Error('Valor não pode ser negativo');
    this.amountNetValueCollected += amount;
    this.touch();
  }

  public removeNetValueCollected(amount: number): void {
    if (amount < 0) throw new Error('Valor não pode ser negativo');
    if (this.amountNetValueCollected < amount) {
      throw new Error('Valor líquido coletado insuficiente');
    }
    this.amountNetValueCollected -= amount;
    this.touch();
  }

  public addSpentAmount(amount: number): void {
    if (amount < 0) throw new Error('Valor não pode ser negativo');
    this.amountSpent += amount;
    this.touch();
  }

  public removeSpentAmount(amount: number): void {
    if (amount < 0) throw new Error('Valor não pode ser negativo');
    if (this.amountSpent < amount) {
      throw new Error('Valor gasto insuficiente');
    }
    this.amountSpent -= amount;
    this.touch();
  }

  public removeImage(): void {
    this.imageUrl = undefined;
    this.touch();
  }

  public removeLogo(): void {
    this.logoUrl = undefined;
    this.touch();
  }
}
