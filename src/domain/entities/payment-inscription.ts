import Decimal from 'decimal.js';
import { StatusPayment } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type PaymentInscriptionCreateDto = {
  inscriptionId: string;
  eventId: string;
  accountId: string;
  status: StatusPayment;
  imageUrl: string;
  value: Decimal;
};

export type PaymentInscriptionWithDto = {
  id: string;
  inscriptionId: string;
  eventId: string;
  accountId: string;
  status: StatusPayment;
  value: Decimal;
  imageUrl: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class PaymentInscription extends Entity {
  private constructor(
    id: string,
    private inscriptionId: string,
    private eventId: string,
    private accountId: string,
    private status: StatusPayment,
    private value: Decimal,
    private imageUrl: string,
    createdAt: Date,
    updatedAt: Date,
    private rejectionReason?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    inscriptionId,
    eventId,
    accountId,
    status,
    value,
    imageUrl,
  }: PaymentInscriptionCreateDto) {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new PaymentInscription(
      id,
      inscriptionId,
      eventId,
      accountId,
      status,
      value,
      imageUrl,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    inscriptionId,
    eventId,
    accountId,
    status,
    value,
    imageUrl,
    createdAt,
    updatedAt,
    rejectionReason,
  }: PaymentInscriptionWithDto): PaymentInscription {
    return new PaymentInscription(
      id,
      inscriptionId,
      eventId,
      accountId,
      status,
      value,
      imageUrl,
      createdAt,
      updatedAt,
      rejectionReason,
    );
  }

  protected validate(): void {
    if (Number(this.value) <= 0) {
      throw new Error('O valor do pagamento não pode ser zero');
    }
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getInscriptionId(): string {
    return this.inscriptionId;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getStatus(): StatusPayment {
    return this.status;
  }

  public getValue(): Decimal {
    return this.value;
  }

  public getImageUrl(): string {
    return this.imageUrl;
  }

  public getRejectionReason(): string | undefined {
    return this.rejectionReason;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
