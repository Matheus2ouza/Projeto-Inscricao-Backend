import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';
import { statusEvent } from 'generated/prisma';

export type EventCreateDto = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  imageUrl?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  paymentEnabled: boolean;
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
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
  paymentEnabled: boolean;
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
    private imageUrl?: string,
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
    location,
    longitude,
    latitude,
    status,
    paymentEnabled,
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
      imageUrl,
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
    location,
    longitude,
    latitude,
    status,
    paymentEnabled,
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
      imageUrl,
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

  public setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
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

  public openEvent(): any {
    this.status = 'OPEN';
    this.updatedAt = new Date();
  }

  public closeEvent(): void {
    this.status = 'CLOSE';
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
}
