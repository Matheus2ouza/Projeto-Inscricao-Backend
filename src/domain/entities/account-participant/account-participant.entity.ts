import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipantValidatorFactory } from 'src/domain/factories/account-participant/account-participant.validator.factory';
import { Entity } from 'src/domain/shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';

export type AccountParticipantCreateDto = {
  localityId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type AccountParticipantWithDto = {
  id: string;
  localityId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  createdAt: Date;
  updatedAt: Date;
};

export type AccountParticipantUpdateDto = {
  localityId?: string;
  name?: string;
  preferredName?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export class AccountParticipant extends Entity {
  private constructor(
    id: string,
    private localityId: string,
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
    localityId,
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
      localityId,
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
    localityId,
    name,
    preferredName,
    cpf,
    birthDate,
    gender,
    shirtSize,
    shirtType,
    createdAt,
    updatedAt,
  }: AccountParticipantWithDto): AccountParticipant {
    return new AccountParticipant(
      id,
      localityId,
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

  protected validate(): void {
    AccountParticipantValidatorFactory.create().validate(this);
  }

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  // Getters
  public getLocalityId(): string {
    return this.localityId;
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

  public getGender(): genderType {
    return this.gender;
  }

  public getShirtSize(): ShirtSize | undefined {
    return this.shirtSize;
  }

  public getShirtType(): ShirtType | undefined {
    return this.shirtType;
  }

  // Setters
  public setLocalityId(localityId: string): void {
    this.localityId = localityId;
    this.touch();
  }

  public setName(name: string): void {
    this.name = name;
    this.touch();
  }

  public setPreferredName(preferredName: string | undefined): void {
    this.preferredName = preferredName;
    this.touch();
  }

  public setCpf(cpf: string | undefined): void {
    this.cpf = cpf;
    this.touch();
  }

  public setBirthDate(birthDate: Date): void {
    this.birthDate = birthDate;
    this.touch();
  }

  public setGender(gender: genderType): void {
    this.gender = gender;
    this.touch();
  }

  public setShirtSize(shirtSize: ShirtSize | undefined): void {
    this.shirtSize = shirtSize;
    this.touch();
  }

  public setShirtType(shirtType: ShirtType | undefined): void {
    this.shirtType = shirtType;
    this.touch();
  }

  // Método para atualização em lote
  public update(data: AccountParticipantUpdateDto): void {
    if (data.localityId !== undefined) this.localityId = data.localityId;
    if (data.name !== undefined) this.name = data.name;
    if (data.preferredName !== undefined)
      this.preferredName = data.preferredName;
    if (data.cpf !== undefined) this.cpf = data.cpf;
    if (data.birthDate !== undefined) this.birthDate = data.birthDate;
    if (data.gender !== undefined) this.gender = data.gender;
    if (data.shirtSize !== undefined) this.shirtSize = data.shirtSize;
    if (data.shirtType !== undefined) this.shirtType = data.shirtType;

    this.touch();
  }
}
