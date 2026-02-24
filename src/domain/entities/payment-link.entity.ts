import { Utils } from 'src/shared/utils/utils';
import { PaymentLinkValidatorFactory } from '../factories/payment-link/payment-link.validator.factory';
import { Entity } from '../shared/entities/entity';

export type PaymentLinkCreateDto = {
  name: string;
  description: string;
  value: number;
  asaasPaymentLinkId: string;
  url: string;
  active: boolean;
  endDateAt: Date;
};

export type PaymentLinkWithDto = {
  id: string;
  name: string;
  description: string;
  value: number;
  asaasPaymentLinkId: string;
  url: string;
  active: boolean;
  endDateAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class PaymentLink extends Entity {
  constructor(
    id: string,
    private name: string,
    private description: string,
    private value: number,
    private asaasPaymentLinkId: string,
    private url: string,
    private active: boolean,
    private endDateAt: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    name,
    description,
    value,
    asaasPaymentLinkId,
    url,
    active,
    endDateAt,
  }: PaymentLinkCreateDto): PaymentLink {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new PaymentLink(
      id,
      name,
      description,
      value,
      asaasPaymentLinkId,
      url,
      active,
      endDateAt,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    name,
    description,
    value,
    asaasPaymentLinkId,
    url,
    active,
    endDateAt,
    createdAt,
    updatedAt,
  }: PaymentLinkWithDto): PaymentLink {
    return new PaymentLink(
      id,
      name,
      description,
      value,
      asaasPaymentLinkId,
      url,
      active,
      endDateAt,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    PaymentLinkValidatorFactory.create().validate(this);
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getAsaasPaymentLinkId(): string {
    return this.asaasPaymentLinkId;
  }

  public getValue(): number {
    return this.value;
  }

  public getUrl(): string {
    return this.url;
  }

  public getActive(): boolean {
    return this.active;
  }

  public getEndDateAt(): Date {
    return this.endDateAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
