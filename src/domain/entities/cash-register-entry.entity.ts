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
  value: number;
  description?: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  transferId?: string;
  responsible?: string;
  imageUrl?: string;
};

export type CashRegisterEntryWithDto = {
  id: string;
  cashRegisterId: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  transferId?: string;
  responsible?: string;
  imageUrl?: string;
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
    createdAt: Date,
    updatedAt: Date,
    private description?: string,
    private eventId?: string,
    private paymentInstallmentId?: string,
    private onSiteRegistrationId?: string,
    private eventExpenseId?: string,
    private ticketSaleId?: string,
    private transferId?: string,
    private responsible?: string,
    private imageUrl?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    cashRegisterId,
    type,
    origin,
    method,
    value,
    description,
    eventId,
    paymentInstallmentId,
    onSiteRegistrationId,
    eventExpenseId,
    ticketSaleId,
    transferId,
    responsible,
    imageUrl,
  }: CashRegisterEntryCreateDto): CashRegisterEntry {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new CashRegisterEntry(
      id,
      cashRegisterId,
      type,
      origin,
      method,
      value,
      createdAt,
      updatedAt,
      description,
      eventId,
      paymentInstallmentId,
      onSiteRegistrationId,
      eventExpenseId,
      ticketSaleId,
      transferId,
      responsible,
      imageUrl,
    );
  }

  public static with({
    id,
    cashRegisterId,
    type,
    origin,
    method,
    value,
    description,
    eventId,
    paymentInstallmentId,
    onSiteRegistrationId,
    eventExpenseId,
    ticketSaleId,
    transferId,
    responsible,
    imageUrl,
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
      createdAt,
      updatedAt,
      description,
      eventId,
      paymentInstallmentId,
      onSiteRegistrationId,
      eventExpenseId,
      ticketSaleId,
      transferId,
      responsible,
      imageUrl,
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

  public getValue(): number {
    return this.value;
  }

  public getDescription(): string | undefined {
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

  public getImageUrl(): string | undefined {
    return this.imageUrl;
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
}
