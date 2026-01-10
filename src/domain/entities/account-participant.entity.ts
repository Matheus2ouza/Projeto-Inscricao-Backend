import { genderType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { AccountParticipantValidatorFactory } from '../factories/account-participant/account-participant.validator.factory';
import { Entity } from '../shared/entities/entity';

export type AccountParticipantCreateDto = {
  accountId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
};

export type AccountParticipantWithDto = {
  id: string;
  accountId: string;
  name: string;
  birthDate: Date;
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
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    accountId,
    name,
    birthDate,
    gender,
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
    );
  }

  public static with({
    id,
    accountId,
    name,
    birthDate,
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
    );
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

  public getBirthDate(): Date {
    return this.birthDate;
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
