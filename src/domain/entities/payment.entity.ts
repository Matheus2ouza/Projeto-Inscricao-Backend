import { PaymentMethod, StatusPayment } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { PaymentValidatorFactory } from '../factories/payment/payment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentCreateDto = {
  eventId: string;
  accountId: string;
  status: StatusPayment;
  methodPayment?: PaymentMethod;
  totalValue: number;
  imageUrl: string;
};

export type PaymentWithDto = {
  id: string;
  eventId: string;
  accountId: string;
  status: StatusPayment;
  methodPayment: PaymentMethod;
  totalValue: number;
  rejectionReason?: string;
  imageUrl?: string;
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
    private methodPayment: PaymentMethod,
    private totalValue: number,
    createdAt: Date,
    updatedAt: Date,
    private imageUrl?: string,
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
    methodPayment,
  }: PaymentCreateDto): Payment {
    const id = Utils.generateUUID();
    const methodPaymentDefault = methodPayment || PaymentMethod.PIX;
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Payment(
      id,
      eventId,
      accountId,
      status,
      methodPaymentDefault,
      totalValue,
      createdAt,
      updatedAt,
      imageUrl,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    status,
    methodPayment,
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
      methodPayment,
      totalValue,
      createdAt,
      updatedAt,
      imageUrl,
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

  public getMethodPayment(): PaymentMethod {
    return this.methodPayment;
  }

  public getTotalValue(): number {
    return this.totalValue;
  }

  public getImageUrl(): string | undefined {
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

  public setMethodPayment(methodPayment: PaymentMethod): void {
    this.methodPayment = methodPayment;
  }

  public approve(approvedBy: string, financialMovementId: string): void {
    this.status = StatusPayment.APPROVED;
    this.financialMovementId = financialMovementId;
    this.updatedAt = new Date();
    this.approvedBy = approvedBy;
    if (this.getRejectionReason()) {
      this.rejectionReason = undefined;
    }
  }

  public recuse(rejectionReason: string): void {
    this.status = StatusPayment.REFUSED;
    this.updatedAt = new Date();
    this.rejectionReason = rejectionReason;
  }

  public reverse(): void {
    this.status = StatusPayment.UNDER_REVIEW;
    this.updatedAt = new Date();
    if (this.getApprovedBy()) {
      this.approvedBy = undefined;
    }
    if (this.getRejectionReason()) {
      this.rejectionReason = undefined;
    }
  }
}
