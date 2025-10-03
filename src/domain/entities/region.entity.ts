import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type RegionCreateDto = {
  name: string;
  outstandingBalance?: number;
};

export type RegionWithDto = {
  id: string;
  name: string;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Region extends Entity {
  private constructor(
    id: string,
    private name: string,
    private outstandingBalance: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    name,
    outstandingBalance = 0,
  }: RegionCreateDto): Region {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Region(id, name, outstandingBalance, createdAt, updatedAt);
  }

  public static with({
    id,
    name,
    outstandingBalance,
    createdAt,
    updatedAt,
  }: RegionWithDto): Region {
    return new Region(id, name, outstandingBalance, createdAt, updatedAt);
  }

  protected validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Nome da região é obrigatório');
    }
    if (this.outstandingBalance < 0) {
      throw new Error('Saldo em aberto não pode ser negativo');
    }
  }

  public getName(): string {
    return this.name;
  }

  public getOutstandingBalance(): number {
    return this.outstandingBalance;
  }
}
