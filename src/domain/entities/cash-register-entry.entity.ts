import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { CashRegisterEntryValidatorFactory } from '../factories/cash-register-entry/cash-register-entry.validator.factory';
import { Entity } from '../shared/entities/entity';

export type CashRegisterEntryCreateDto = {
  cashRegisterId: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  favorite?: boolean;
  value: number;
  imageUrls?: string[];
  description: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  transferId?: string;
  responsible?: string;
  createAt?: Date;
};

export type CashRegisterEntryUpdateDto = {
  type?: CashEntryType;
  origin?: CashEntryOrigin;
  method?: PaymentMethod;
  favorite?: boolean;
  value?: number;
  description?: string;
  responsible?: string;
};

export type CashRegisterEntryWithDto = {
  id: string;
  cashRegisterId: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  favorite?: boolean;
  value: number;
  imageUrls: string[];
  description: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  transferId?: string;
  responsible?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class CashRegisterEntry extends Entity {
  constructor(
    id: string,
    private cashRegisterId: string,
    private type: CashEntryType,
    private origin: CashEntryOrigin,
    private method: PaymentMethod,
    private value: number,
    private imageUrls: string[] = [],
    private description: string,
    createdAt: Date,
    updatedAt: Date,
    private eventId?: string,
    private paymentInstallmentId?: string,
    private onSiteRegistrationId?: string,
    private eventExpenseId?: string,
    private ticketSaleId?: string,
    private transferId?: string,
    private responsible?: string,
    private favorite?: boolean,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    cashRegisterId,
    type,
    origin,
    method,
    favorite,
    value,
    description,
    eventId,
    paymentInstallmentId,
    onSiteRegistrationId,
    eventExpenseId,
    ticketSaleId,
    transferId,
    responsible,
    imageUrls,
    createAt,
  }: CashRegisterEntryCreateDto): CashRegisterEntry {
    const id = Utils.generateUUID();
    const favoriteDefault = favorite ?? false;
    const createdAt = createAt ?? new Date();
    const updatedAt = new Date();

    const imagesDefault = imageUrls ?? [];

    return new CashRegisterEntry(
      id,
      cashRegisterId,
      type,
      origin,
      method,
      value,
      imagesDefault,
      description,
      createdAt,
      updatedAt,
      eventId,
      paymentInstallmentId,
      onSiteRegistrationId,
      eventExpenseId,
      ticketSaleId,
      transferId,
      responsible,
      favoriteDefault,
    );
  }

  public static with({
    id,
    cashRegisterId,
    type,
    origin,
    method,
    favorite,
    value,
    description,
    eventId,
    paymentInstallmentId,
    onSiteRegistrationId,
    eventExpenseId,
    ticketSaleId,
    transferId,
    responsible,
    imageUrls,
    createdAt,
    updatedAt,
  }: CashRegisterEntryWithDto): CashRegisterEntry {
    return new CashRegisterEntry(
      id,
      cashRegisterId,
      type,
      origin,
      method,
      value,
      imageUrls,
      description,
      createdAt,
      updatedAt,
      eventId,
      paymentInstallmentId,
      onSiteRegistrationId,
      eventExpenseId,
      ticketSaleId,
      transferId,
      responsible,
      favorite,
    );
  }

  public getId(): string {
    return this.id;
  }

  public getCashRegisterId(): string {
    return this.cashRegisterId;
  }

  public getType(): CashEntryType {
    return this.type;
  }

  public getOrigin(): CashEntryOrigin {
    return this.origin;
  }

  public getMethod(): PaymentMethod {
    return this.method;
  }

  public getFavorite(): boolean {
    return this.favorite ?? false;
  }

  public getValue(): number {
    return this.value;
  }

  public getDescription(): string {
    return this.description;
  }

  public getEventId(): string | undefined {
    return this.eventId;
  }

  public getPaymentInstallmentId(): string | undefined {
    return this.paymentInstallmentId;
  }

  public getOnSiteRegistrationId(): string | undefined {
    return this.onSiteRegistrationId;
  }

  public getEventExpenseId(): string | undefined {
    return this.eventExpenseId;
  }

  public getTicketSaleId(): string | undefined {
    return this.ticketSaleId;
  }

  public getTransferId(): string | undefined {
    return this.transferId;
  }

  public getResponsible(): string | undefined {
    return this.responsible;
  }

  public getImageUrls(): string[] {
    return this.imageUrls;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected validate(): void {
    CashRegisterEntryValidatorFactory.create().validate(this);
  }

  public update({
    type,
    origin,
    method,
    favorite,
    value,
    description,
    responsible,
  }: CashRegisterEntryUpdateDto): void {
    if (type !== undefined) {
      this.type = type;
    }

    if (origin !== undefined) {
      this.origin = origin;
    }

    if (method !== undefined) {
      this.method = method;
    }

    if (favorite !== undefined) {
      this.favorite = favorite;
    }

    if (value !== undefined) {
      this.value = value;
    }

    if (description !== undefined) {
      this.description = description;
    }

    if (responsible !== undefined) {
      this.responsible = responsible;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  public addImageUrls(urls: string[]): void {
    this.imageUrls = [...this.imageUrls, ...urls];
    this.updatedAt = new Date();
    this.validate();
  }

  public removeImageUrl(index: number): void {
    this.imageUrls.splice(index, 1);
    this.updatedAt = new Date();
    this.validate();
  }
}
