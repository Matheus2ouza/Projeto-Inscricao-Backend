import { PaymentMethod, StatusPayment } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { PaymentValidatorFactory } from '../factories/payment/payment.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentCreateDto = {
  eventId: string;
  accountId?: string;
  guestName?: string;
  guestEmail?: string;
  accessToken?: string;
  isGuest?: boolean;
  status: StatusPayment;
  methodPayment?: PaymentMethod;
  totalValue: number;
  totalPaid?: number;
  totalNetValue?: number;
  totalReceived?: number;
  installment: number;
  paidInstallments?: number;
  asaasCheckoutId?: string;
  paymentLinkId?: string;
  externalReference?: string;
  imageUrls?: string[];
  approvedBy?: string;
  createdAt?: Date;
};

export type PaymentWithDto = {
  id: string;
  eventId: string;
  accountId?: string;
  guestName?: string;
  guestEmail?: string;
  accessToken?: string;
  isGuest?: boolean;
  status: StatusPayment;
  methodPayment: PaymentMethod;
  totalValue: number;
  totalPaid: number;
  totalNetValue: number;
  totalReceived: number;
  installments: number;
  paidInstallments: number;
  imageUrls: string[];
  rejectionReason?: string;
  asaasCheckoutId?: string;
  paymentLinkId?: string;
  externalReference?: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Payment extends Entity {
  private readonly eventId: string;
  private status: StatusPayment;
  private methodPayment: PaymentMethod;
  private totalValue: number;
  private totalPaid: number;
  private totalNetValue: number;
  private totalReceived: number;
  private installments: number;
  private paidInstallments: number;
  private imageUrls: string[];
  private accountId?: string;
  private guestName?: string;
  private guestEmail?: string;
  private accessToken?: string;
  private isGuest?: boolean;
  private asaasCheckoutId?: string;
  private paymentLinkId?: string;
  private externalReference?: string;
  private rejectionReason?: string;
  private approvedBy?: string;

  constructor(
    id: string,
    eventId: string,
    status: StatusPayment,
    methodPayment: PaymentMethod,
    totalValue: number,
    totalPaid: number,
    totalNetValue: number,
    totalReceived: number,
    installments: number,
    paidInstallments: number,
    imageUrls: string[],
    createdAt: Date,
    updatedAt: Date,
    accountId?: string,
    guestName?: string,
    guestEmail?: string,
    accessToken?: string,
    isGuest?: boolean,
    asaasCheckoutId?: string,
    paymentLinkId?: string,
    externalReference?: string,
    rejectionReason?: string,
    approvedBy?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.eventId = eventId;
    this.status = status;
    this.methodPayment = methodPayment;
    this.totalValue = totalValue;
    this.totalPaid = totalPaid;
    this.totalNetValue = totalNetValue;
    this.totalReceived = totalReceived;
    this.installments = installments;
    this.paidInstallments = paidInstallments;
    this.imageUrls = imageUrls;
    this.accountId = accountId;
    this.guestName = guestName;
    this.guestEmail = guestEmail;
    this.accessToken = accessToken;
    this.isGuest = isGuest;
    this.asaasCheckoutId = asaasCheckoutId;
    this.paymentLinkId = paymentLinkId;
    this.externalReference = externalReference;
    this.rejectionReason = rejectionReason;
    this.approvedBy = approvedBy;
    this.validate();
  }

  public static create({
    eventId,
    accountId,
    guestName,
    guestEmail,
    accessToken,
    isGuest,
    status,
    methodPayment,
    totalValue,
    totalPaid,
    totalNetValue,
    totalReceived,
    installment,
    paidInstallments,
    imageUrls,
    asaasCheckoutId,
    paymentLinkId,
    externalReference,
    approvedBy,
    createdAt,
  }: PaymentCreateDto): Payment {
    const id = Utils.generateUUID();
    const methodPaymentDefault = methodPayment || PaymentMethod.PIX;
    const totalPaidDefault = totalPaid || 0;
    const totalReceivedDefault = totalReceived || 0;
    const totalNetValueDefault = totalNetValue || 0;
    const installmentsDefault = installment || 1;
    const paidInstallmentsDefault = paidInstallments || 0;
    const createdAtDefault = createdAt || new Date();
    const updatedAt = new Date();

    const isGuestDefault = isGuest || false;
    let accessTokenDefault = accessToken;
    if (isGuestDefault) {
      accessTokenDefault = Utils.generateUUID();
    } else {
      accessTokenDefault = undefined;
    }

    return new Payment(
      id,
      eventId,
      status,
      methodPaymentDefault,
      totalValue,
      totalPaidDefault,
      totalNetValueDefault,
      totalReceivedDefault,
      installmentsDefault,
      paidInstallmentsDefault,
      imageUrls || [],
      createdAtDefault,
      updatedAt,
      accountId,
      guestName,
      guestEmail,
      accessTokenDefault,
      isGuestDefault,
      asaasCheckoutId,
      paymentLinkId,
      externalReference,
      undefined, // rejectionReason
      approvedBy,
    );
  }

  public static with({
    id,
    eventId,
    accountId,
    guestName,
    guestEmail,
    accessToken,
    isGuest,
    status,
    methodPayment,
    totalValue,
    totalPaid,
    totalNetValue,
    totalReceived,
    installments,
    paidInstallments,
    imageUrls,
    asaasCheckoutId,
    paymentLinkId,
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
      totalReceived,
      installments,
      paidInstallments,
      imageUrls,
      createdAt,
      updatedAt,
      accountId,
      guestName,
      guestEmail,
      accessToken,
      isGuest,
      asaasCheckoutId,
      paymentLinkId,
      externalReference,
      rejectionReason,
      approvedBy,
    );
  }

  protected validate(): void {
    PaymentValidatorFactory.create().validate(this);
  }

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  // Getters
  public getEventId(): string {
    return this.eventId;
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

  public getTotalReceived(): number {
    return this.totalReceived;
  }

  public getInstallments(): number {
    return this.installments;
  }

  public getPaidInstallments(): number {
    return this.paidInstallments;
  }

  public getImageUrls(): string[] {
    return this.imageUrls;
  }

  public getAccountId(): string | undefined {
    return this.accountId;
  }

  public getGuestName(): string | undefined {
    return this.guestName;
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

  public getAsaasCheckoutId(): string | undefined {
    return this.asaasCheckoutId;
  }

  public getPaymentLinkId(): string | undefined {
    return this.paymentLinkId;
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

  // Métodos de negócio
  public isFullyPaid(): boolean {
    return this.paidInstallments >= this.installments;
  }

  public setMethodPayment(methodPayment: PaymentMethod): void {
    this.methodPayment = methodPayment;
    this.touch();
  }

  public approve(approvedBy: string): void {
    this.status = StatusPayment.APPROVED;
    this.approvedBy = approvedBy;
    if (this.rejectionReason) {
      this.rejectionReason = undefined;
    }
    this.touch();
  }

  public recuse(rejectionReason: string): void {
    this.status = StatusPayment.REFUSED;
    this.rejectionReason = rejectionReason;
    this.touch();
  }

  public reverse(): void {
    if (this.status === StatusPayment.APPROVED) {
      this.paidInstallments = 0;
      this.totalPaid = 0;
      this.totalNetValue = 0;
      this.approvedBy = undefined;
    }
    if (this.rejectionReason) {
      this.rejectionReason = undefined;
    }
    this.status = StatusPayment.UNDER_REVIEW;
    this.touch();
  }

  public addPaidInstallment(value: number, netValue: number): void {
    this.totalPaid += value;
    this.totalNetValue += netValue;
    this.paidInstallments += 1;
    this.touch();
  }

  public setTotalNetValue(totalNetValue: number): void {
    this.totalNetValue = totalNetValue;
    this.touch();
  }

  public setInstallments(installments: number): void {
    this.installments = installments;
    this.touch();
  }

  public setTotalReceived(totalReceived: number): void {
    this.totalReceived += totalReceived;
    this.touch();
  }

  public setImageUrls(image: string): void {
    this.imageUrls.push(image);
    this.touch();
  }

  public updateImage(imageUrl: string): void {
    this.imageUrls = [imageUrl];
    // Se estava rejeitado, volta para análise
    if (this.status === StatusPayment.REFUSED) {
      this.status = StatusPayment.UNDER_REVIEW;
    }
    this.touch();
  }
}
