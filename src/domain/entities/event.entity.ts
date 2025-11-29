import { statusEvent } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

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
  paymentEnabled: boolean;
  ticketEnabled?: boolean;
};

export type EventWithDto = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  quantityParticipants: number;
  amountCollected: number;
  regionId: string;
  imageUrl?: string;
  logoUrl?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  paymentEnabled: boolean;
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
    private regionId: string,
    createdAt: Date,
    updatedAt: Date,
    private status: statusEvent,
    private paymentEnabled: boolean,
    private ticketEnabled?: boolean,
    private imageUrl?: string,
    private logoUrl?: string,
    private location?: string,
    private longitude?: number | null,
    private latitude?: number | null,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

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
    paymentEnabled,
    ticketEnabled,
  }: EventCreateDto): Event {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const quantityParticipants = 0;
    const amountCollected = 0;

    return new Event(
      id,
      name,
      startDate,
      endDate,
      quantityParticipants,
      amountCollected,
      regionId,
      createdAt,
      updatedAt,
      status,
      paymentEnabled,
      ticketEnabled,
      imageUrl,
      logoUrl,
      location,
      longitude,
      latitude,
    );
  }

  public static with({
    id,
    name,
    startDate,
    endDate,
    quantityParticipants,
    amountCollected,
    regionId,
    imageUrl,
    logoUrl,
    location,
    longitude,
    latitude,
    status,
    paymentEnabled,
    ticketEnabled,
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
      regionId,
      createdAt,
      updatedAt,
      status,
      paymentEnabled,
      ticketEnabled,
      imageUrl,
      logoUrl,
      location,
      longitude,
      latitude,
    );
  }

  protected validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Nome do evento é obrigatório');
    }
    if (!this.startDate || !this.endDate) {
      throw new Error('Data inicial e final do evento são obrigatórias');
    }
    if (!this.regionId || this.regionId.trim().length === 0) {
      throw new Error('ID da região é obrigatório');
    }
    if (!this.updatedAt) {
      throw new Error('Data de atualização é obrigatória');
    }
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

  public getRegionId(): string {
    return this.regionId;
  }

  public getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  public getLogoUrl(): string | undefined {
    return this.logoUrl;
  }

  public setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
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

  public getPaymentEnabled(): boolean {
    return this.paymentEnabled;
  }

  public getTicketEnabled(): boolean | undefined {
    return this.ticketEnabled;
  }

  public setName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
    this.validate();
  }

  public setStartDate(startDate: Date): void {
    this.startDate = startDate;
    this.updatedAt = new Date();
    this.validate();
  }

  public setEndDate(endDate: Date): void {
    this.endDate = endDate;
    this.updatedAt = new Date();
    this.validate();
  }

  public setLocation(location?: string): void {
    this.location = location;
    this.updatedAt = new Date();
  }

  public setLongitude(longitude?: number | null): void {
    this.longitude = longitude;
    this.updatedAt = new Date();
  }

  public setLatitude(latitude?: number | null): void {
    this.latitude = latitude;
    this.updatedAt = new Date();
  }

  public update({
    name,
    startDate,
    endDate,
    location,
    longitude,
    latitude,
  }: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    longitude?: number | null;
    latitude?: number | null;
  }): void {
    if (name !== undefined) {
      this.setName(name);
    }
    if (startDate !== undefined) {
      this.setStartDate(startDate);
    }
    if (endDate !== undefined) {
      this.setEndDate(endDate);
    }
    if (location !== undefined) {
      this.setLocation(location);
    }
    if (longitude !== undefined) {
      this.setLongitude(longitude);
    }
    if (latitude !== undefined) {
      this.setLatitude(latitude);
    }
  }

  public openEvent(): any {
    this.status = 'OPEN';
    this.updatedAt = new Date();
  }

  public closeEvent(): void {
    this.status = 'CLOSE';
    this.updatedAt = new Date();
  }

  public updateImage(imageUrl: string): void {
    this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }

  public updateLogoUrl(logoUrl: string): void {
    if (!logoUrl || logoUrl.trim().length === 0) {
      throw new Error('logoUrl não pode ser vazio');
    }

    this.logoUrl = logoUrl;
    this.updatedAt = new Date();
  }

  public updateLocation(
    location: string,
    longitude: number,
    latitude: number,
  ): void {
    this.location = location;
    this.longitude = longitude;
    this.latitude = latitude;
  }

  public deleteImage(): void {
    this.imageUrl = undefined;
    this.updatedAt = new Date();
  }

  public deleteLogo(): void {
    this.logoUrl = undefined;
    this.updatedAt = new Date();
  }

  public incrementParticipantsCount(): void {
    this.quantityParticipants += 1;
    this.updatedAt = new Date();
  }

  public incrementAmountCollected(amount: number): void {
    this.amountCollected += amount;
    this.updatedAt = new Date();
  }

  public enableTicket(): void {
    this.ticketEnabled = true;
    this.updatedAt = new Date();
  }

  public disableTicket(): void {
    this.ticketEnabled = false;
    this.updatedAt = new Date();
  }
}
