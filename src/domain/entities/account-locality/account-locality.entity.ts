import { AccountLocalityValidatorFactory } from 'src/domain/factories/account-locality/account-locality.validator.factory';
import { Entity } from 'src/domain/shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';

export type AccountLocalityCreateDto = {
  accountId: string;
  localityId: string;
};

export type AccountLocalityWithDto = {
  id: string;
  accountId: string;
  localityId: string;
  createdAt: Date;
};

export type AccountLocalityUpdateDto = {
  accountId?: string;
  localityId?: string;
};

export class AccountLocality extends Entity {
  private constructor(
    id: string,
    private accountId: string,
    private localityId: string,
    createdAt: Date,
  ) {
    super(id, createdAt, new Date()); // updatedAt não existe no modelo, mas passamos a data atual
    this.validate();
  }

  public static create({
    accountId,
    localityId,
  }: AccountLocalityCreateDto): AccountLocality {
    const id = Utils.generateUUID();
    const createdAt = new Date();

    return new AccountLocality(id, accountId, localityId, createdAt);
  }

  public static with({
    id,
    accountId,
    localityId,
    createdAt,
  }: AccountLocalityWithDto): AccountLocality {
    return new AccountLocality(id, accountId, localityId, createdAt);
  }

  protected validate(): void {
    AccountLocalityValidatorFactory.create().validate(this);
  }

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  // Getters
  public getAccountId(): string {
    return this.accountId;
  }

  public getLocalityId(): string {
    return this.localityId;
  }

  // Setters
  public setAccountId(accountId: string): void {
    this.accountId = accountId;
    this.touch();
  }

  public setLocalityId(localityId: string): void {
    this.localityId = localityId;
    this.touch();
  }

  // Método para atualização em lote
  public update(data: AccountLocalityUpdateDto): void {
    if (data.accountId !== undefined) {
      this.accountId = data.accountId;
    }
    if (data.localityId !== undefined) {
      this.localityId = data.localityId;
    }
    this.touch();
  }
}
