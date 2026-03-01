import { Utils } from 'src/shared/utils/utils';
import { CashRegisterTransferValidatorFactory } from '../factories/cash-register-transfer/cash-register-transfer.validator.factory';
import { Entity } from '../shared/entities/entity';

export type CashRegisterTransferCreateDto = {
  fromCashId: string;
  toCashId: string;
  value: number;
  description?: string;
  responsible?: string;
  imageUrl?: string;
};

export type CashRegisterTransferWithDto = {
  id: string;
  fromCashId: string;
  toCashId: string;
  value: number;
  description?: string;
  responsible?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class CashRegisterTransfer extends Entity {
  constructor(
    id: string,
    private fromCashId: string,
    private toCashId: string,
    private value: number,
    createdAt: Date,
    updatedAt: Date,
    private description?: string,
    private responsible?: string,
    private imageUrl?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    fromCashId,
    toCashId,
    value,
    description,
    responsible,
    imageUrl,
  }: CashRegisterTransferCreateDto): CashRegisterTransfer {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new CashRegisterTransfer(
      id,
      fromCashId,
      toCashId,
      value,
      createdAt,
      updatedAt,
      description,
      responsible,
      imageUrl,
    );
  }

  public static with({
    id,
    fromCashId,
    toCashId,
    value,
    description,
    responsible,
    imageUrl,
    createdAt,
    updatedAt,
  }: CashRegisterTransferWithDto): CashRegisterTransfer {
    return new CashRegisterTransfer(
      id,
      fromCashId,
      toCashId,
      value,
      createdAt,
      updatedAt,
      description,
      responsible,
      imageUrl,
    );
  }

  public getId(): string {
    return this.id;
  }

  public getFromCashId(): string {
    return this.fromCashId;
  }

  public getToCashId(): string {
    return this.toCashId;
  }

  public getValue(): number {
    return this.value;
  }

  public getDescription(): string | undefined {
    return this.description;
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
    CashRegisterTransferValidatorFactory.create().validate(this);
  }
}
