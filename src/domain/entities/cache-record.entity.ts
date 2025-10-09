import { Entity } from '../shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';

export type CacheRecordCreateDto = {
  cacheKey: string;
  payload: any;
  accountId: string;
  expiresAt?: Date;
};

export type CacheRecordWithDto = {
  id: string;
  cacheKey: string;
  payload: any;
  accountId: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class CacheRecord extends Entity {
  private constructor(
    id: string,
    private cacheKey: string,
    private payload: any,
    private accountId: string,
    private expiresAt: Date | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create({
    cacheKey,
    payload,
    accountId,
    expiresAt,
  }: CacheRecordCreateDto): CacheRecord {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new CacheRecord(
      id,
      cacheKey,
      payload,
      accountId,
      expiresAt,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    cacheKey,
    payload,
    accountId,
    expiresAt,
    createdAt,
    updatedAt,
  }: CacheRecordWithDto): CacheRecord {
    return new CacheRecord(
      id,
      cacheKey,
      payload,
      accountId,
      expiresAt,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    if (!this.cacheKey) {
      throw new Error('Cache key é obrigatório');
    }
    if (!this.accountId) {
      throw new Error('Account ID é obrigatório');
    }
  }

  public getCacheKey(): string {
    return this.cacheKey;
  }

  public getPayload(): any {
    return this.payload;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getExpiresAt(): Date | undefined {
    return this.expiresAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  public updatePayload(payload: any): void {
    this.payload = payload;
  }

  public updateExpiresAt(expiresAt: Date): void {
    this.expiresAt = expiresAt;
  }
}
