import { StatusPayment } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { PaymentValidatorFactory } from '../factories/payment/payment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentCreateDto = {
  eventId: string;
  accountId: string;
  status: StatusPayment;
  totalValue: number;
  imageUrl: string;
};

export type PaymentWithDto = {
  id: string;
  eventId: string;
  accountId: string;
  status: StatusPayment;
  totalValue: number;
  rejectionReason?: string;
  imageUrl: string;
  financialMovementId?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Payment extends Entity {
  constructor(
    id: string,
    private eventId: string,
    private accountId: string,
    private status: StatusPayment,
    private totalValue: number,
    private imageUrl: string,
    createdAt: Date,
    updatedAt: Date,
    private rejectionReason?: string,
    private financialMovementId?: string,
    private approvedBy?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    accountId,
    status,
    totalValue,
    imageUrl,
  }: PaymentCreateDto): Payment {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Payment(
      id,
      eventId,
      accountId,
      status,
      totalValue,
      imageUrl,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    status,
    totalValue,
    imageUrl,
    createdAt,
    updatedAt,
    rejectionReason,
    financialMovementId,
    approvedBy,
  }: PaymentWithDto): Payment {
    return new Payment(
      id,
      eventId,
      accountId,
      status,
      totalValue,
      imageUrl,
      createdAt,
      updatedAt,
      rejectionReason,
      financialMovementId,
      approvedBy,
    );
  }

  protected validate(): void {
    PaymentValidatorFactory.create().validate(this);
  }

  public getId(): string {
    return this.id;
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

  public getTotalValue(): number {
    return this.totalValue;
  }

  public getImageUrl(): string {
    return this.imageUrl;
  }

  public getRejectionReason(): string | undefined {
    return this.rejectionReason;
  }

  public getFinancialMovementId(): string | undefined {
    return this.financialMovementId;
  }

  public getApprovedBy(): string | undefined {
    return this.approvedBy;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
