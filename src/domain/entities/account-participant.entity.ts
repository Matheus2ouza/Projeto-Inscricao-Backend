import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { AccountParticipantValidatorFactory } from '../factories/account-participant/account-participant.validator.factory';
import { Entity } from '../shared/entities/entity';

export type AccountParticipantCreateDto = {
  accountId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type AccountParticipantUpdateDto = {
  name?: string;
  preferredName?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type AccountParticipantWithDto = {
  id: string;
  accountId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender: genderType;
  createdAt: Date;
  updatedAt: Date;
};

export class AccountParticipant extends Entity {
  private constructor(
    id: string,
    private accountId: string,
    private name: string,
    private birthDate: Date,
    private gender: genderType,
    createdAt: Date,
    updatedAt: Date,
    private preferredName?: string,
    private cpf?: string,
    private shirtSize?: ShirtSize,
    private shirtType?: ShirtType,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    accountId,
    name,
    preferredName,
    cpf,
    birthDate,
    gender,
    shirtSize,
    shirtType,
  }: AccountParticipantCreateDto): AccountParticipant {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new AccountParticipant(
      id,
      accountId,
      name,
      birthDate,
      gender,
      createdAt,
      updatedAt,
      preferredName,
      cpf,
      shirtSize,
      shirtType,
    );
  }

  public static with({
    id,
    accountId,
    name,
    birthDate,
    preferredName,
    cpf,
    shirtSize,
    shirtType,
    gender,
    createdAt,
    updatedAt,
  }: AccountParticipantWithDto): AccountParticipant {
    return new AccountParticipant(
      id,
      accountId,
      name,
      birthDate,
      gender,
      createdAt,
      updatedAt,
      preferredName,
      cpf,
      shirtSize,
      shirtType,
    );
  }

  public update(data: AccountParticipantUpdateDto): void {
    if (data.name !== undefined) {
      this.name = data.name;
    }

    if (data.preferredName !== undefined) {
      this.preferredName = data.preferredName;
    }

    if (data.cpf !== undefined) {
      this.cpf = data.cpf;
    }

    if (data.birthDate !== undefined) {
      this.birthDate = data.birthDate;
    }

    if (data.gender !== undefined) {
      this.gender = data.gender;
    }

    if (data.shirtSize !== undefined) {
      this.shirtSize = data.shirtSize;
    }

    if (data.shirtType !== undefined) {
      this.shirtType = data.shirtType;
    }

    this.updatedAt = new Date();

    this.validate();
  }

  protected validate(): void {
    AccountParticipantValidatorFactory.create().validate(this);
  }

  public getId(): string {
    return this.id;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getName(): string {
    return this.name;
  }

  public getPreferredName(): string | undefined {
    return this.preferredName;
  }

  public getCpf(): string | undefined {
    return this.cpf;
  }

  public getBirthDate(): Date {
    return this.birthDate;
  }

  public getShirtSize(): ShirtSize | undefined {
    return this.shirtSize;
  }

  public getShirtType(): ShirtType | undefined {
    return this.shirtType;
  }

  public getGender(): genderType {
    return this.gender;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
