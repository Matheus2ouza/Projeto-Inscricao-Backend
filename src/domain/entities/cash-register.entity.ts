import { CashRegisterStatus } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { CashRegisterValidatorFactory } from '../factories/cash-register/cash-register.validator.factory';
import { Entity } from '../shared/entities/entity';

export type CashRegisterCreateDto = {
  name: string;
  regionId: string;
  status: CashRegisterStatus;
  balance: number;
};

export type CashRegisterWithDto = {
  id: string;
  name: string;
  regionId: string;
  status: CashRegisterStatus;
  balance: number;
  openedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class CashRegister extends Entity {
  constructor(
    id: string,
    private name: string,
    private regionId: string,
    private status: CashRegisterStatus,
    private balance: number,
    private openedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    private closedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    name,
    regionId,
    status,
    balance,
  }: CashRegisterCreateDto): CashRegister {
    const id = Utils.generateUUID();
    const openedAt = new Date();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new CashRegister(
      id,
      name,
      regionId,
      status,
      balance,
      openedAt,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    name,
    regionId,
    status,
    balance,
    openedAt,
    closedAt,
    createdAt,
    updatedAt,
  }: CashRegisterWithDto): CashRegister {
    return new CashRegister(
      id,
      name,
      regionId,
      status,
      balance,
      openedAt,
      createdAt,
      updatedAt,
      closedAt,
    );
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getRegionId(): string {
    return this.regionId;
  }

  public getStatus(): CashRegisterStatus {
    return this.status;
  }

  public getBalance(): number {
    return this.balance;
  }

  public getOpenedAt(): Date {
    return this.openedAt;
  }

  public getClosedAt(): Date | undefined {
    return this.closedAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected validate(): void {
    CashRegisterValidatorFactory.create().validate(this);
  }

  public incrementBalance(amount: number): void {
    this.balance += amount;
    this.updatedAt = new Date();
    this.validate();
  }

  public decrementBalance(amount: number): void {
    this.balance -= amount;
    this.updatedAt = new Date();
    this.validate();
  }
}
