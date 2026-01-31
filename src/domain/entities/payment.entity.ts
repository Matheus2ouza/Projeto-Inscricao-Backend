import { PaymentMethod, StatusPayment } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { PaymentValidatorFactory } from '../factories/payment/payment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentCreateDto = {
  eventId: string;
  accountId?: string;
  guestEmail?: string;
  isGuest?: boolean;
  accessToken?: string;
  status: StatusPayment;
  methodPayment?: PaymentMethod;
  totalValue: number;
  totalPaid?: number;
  installment: number;
  asaasCheckoutId?: string;
  externalReference?: string;
  imageUrl?: string;
};

export type PaymentWithDto = {
  id: string;
  eventId: string;
  accountId?: string;
  guestEmail?: string;
  accessToken?: string;
  isGuest?: boolean;
  status: StatusPayment;
  methodPayment: PaymentMethod;
  totalValue: number;
  totalPaid: number;
  totalNetValue: number;
  installments: number;
  paidInstallments: number;
  rejectionReason?: string;
  imageUrl?: string;
  asaasCheckoutId?: string;
  externalReference?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Payment extends Entity {
  constructor(
    id: string,
    private eventId: string,
    private status: StatusPayment,
    private methodPayment: PaymentMethod,
    private totalValue: number,
    private totalPaid: number,
    private totalNetValue: number,
    private installments: number,
    private paidInstallments: number,
    createdAt: Date,
    updatedAt: Date,
    private accountId?: string,
    private guestEmail?: string,
    private accessToken?: string,
    private isGuest?: boolean,
    private imageUrl?: string,
    private asaasCheckoutId?: string,
    private externalReference?: string,
    private rejectionReason?: string,
    private approvedBy?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    eventId,
    accountId,
    guestEmail,
    isGuest,
    status,
    totalValue,
    totalPaid,
    installment,
    imageUrl,
    asaasCheckoutId,
    externalReference,
    methodPayment,
  }: PaymentCreateDto): Payment {
    const id = Utils.generateUUID();
    const methodPaymentDefault = methodPayment || PaymentMethod.PIX;
    const totalPaidDefault = totalPaid || 0;
    const totalNetValueDefault = 0;
    const installmentsDefault = installment || 1;
    const paidInstallmentsDefault = 0;
    const createdAt = new Date();
    const updatedAt = new Date();

    guestEmail = guestEmail || '';
    isGuest = isGuest || false;

    let accessToken: string | undefined = undefined;
    if (isGuest) {
      accessToken = Utils.generateUUID();
    }

    return new Payment(
      id,
      eventId,
      status,
      methodPaymentDefault,
      totalValue,
      totalPaidDefault,
      totalNetValueDefault,
      installmentsDefault,
      paidInstallmentsDefault,
      createdAt,
      updatedAt,
      accountId,
      guestEmail,
      accessToken,
      isGuest,
      imageUrl,
      asaasCheckoutId,
      externalReference,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    guestEmail,
    accessToken,
    isGuest,
    status,
    methodPayment,
    totalValue,
    totalPaid,
    totalNetValue,
    installments,
    paidInstallments,
    imageUrl,
    asaasCheckoutId,
    externalReference,
    createdAt,
    updatedAt,
    rejectionReason,
    approvedBy,
  }: PaymentWithDto): Payment {
    return new Payment(
      id,
      eventId,
      status,
      methodPayment,
      totalValue,
      totalPaid,
      totalNetValue,
      installments,
      paidInstallments,
      createdAt,
      updatedAt,
      accountId,
      guestEmail,
      accessToken,
      isGuest,
      imageUrl,
      asaasCheckoutId,
      externalReference,
      rejectionReason,
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

  public getAccountId(): string | undefined {
    return this.accountId;
  }

  public getGuestEmail(): string | undefined {
    return this.guestEmail;
  }

  public getAccessToken(): string | undefined {
    return this.accessToken;
  }

  public getIsGuest(): boolean | undefined {
    return this.isGuest;
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

  public getTotalPaid(): number {
    return this.totalPaid;
  }

  public getTotalNetValue(): number {
    return this.totalNetValue;
  }

  public getInstallments(): number {
    return this.installments;
  }

  public getPaidInstallments(): number {
    return this.paidInstallments;
  }

  public getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  public getAsaasCheckoutId(): string | undefined {
    return this.asaasCheckoutId;
  }

  public getExternalReference(): string | undefined {
    return this.externalReference;
  }

  public getRejectionReason(): string | undefined {
    return this.rejectionReason;
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

  public isFullyPaid(): boolean {
    return this.paidInstallments >= this.installments;
  }

  public setMethodPayment(methodPayment: PaymentMethod): void {
    this.methodPayment = methodPayment;
  }

  public approve(approvedBy: string): void {
    this.status = StatusPayment.APPROVED;
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

  public addPaidInstallment(value: number, netValue: number): void {
    this.totalPaid += value;
    this.totalNetValue += netValue;
    this.paidInstallments += 1;
  }

  public setTotalNetValue(totalNetValue: number): void {
    this.totalNetValue = totalNetValue;
  }

  public setInstallments(installments: number): void {
    this.installments = installments;
  }
}
