import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type EventCreateDto = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  imageUrl?: string;
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
    private imageUrl: string | undefined,
    createdAt: Date,
    updatedAt: Date,
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
      imageUrl,
      createdAt,
      updatedAt,
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
      imageUrl,
      createdAt,
      updatedAt,
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
}
