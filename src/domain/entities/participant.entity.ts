import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { ParticipantValidatorFactory } from '../factories/participant/participant.validator.factory';
import { Entity } from '../shared/entities/entity';

export type ParticipantCreateDto = {
  inscriptionId: string;
  typeInscriptionId: string;
  name: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate: Date;
  cpf?: string;
  gender: genderType;
};

export type ParticipantWithDto = {
  id: string;
  inscriptionId: string;
  typeInscriptionId: string;
  name: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate: Date;
  cpf?: string;
  gender: genderType;
  createdAt: Date;
  updatedAt: Date;
};

export class Participant extends Entity {
  private constructor(
    id: string,
    private inscriptionId: string,
    private typeInscriptionId: string,
    private name: string,
    private birthDate: Date,
    private gender: genderType,
    createdAt: Date,
    updatedAt: Date,
    private preferredName?: string,
    private shirtSize?: ShirtSize,
    private shirtType?: ShirtType,
    private cpf?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    inscriptionId,
    typeInscriptionId,
    name,
    preferredName,
    shirtSize,
    shirtType,
    birthDate,
    cpf,
    gender,
  }: ParticipantCreateDto) {
    const id = Utils.generateUUID();
    const shirtSizeDefault = shirtSize || ShirtSize.M;
    const shirtTypeDefault = shirtType || ShirtType.TRADICIONAL;

    const createdAt = new Date();
    const updatedAt = new Date();

    return new Participant(
      id,
      inscriptionId,
      typeInscriptionId,
      name,
      birthDate,
      gender,
      createdAt,
      updatedAt,
      preferredName,
      shirtSizeDefault,
      shirtTypeDefault,
      cpf,
    );
  }

  public static with({
    id,
    inscriptionId,
    typeInscriptionId,
    name,
    preferredName,
    shirtSize,
    shirtType,
    birthDate,
    cpf,
    gender,
    createdAt,
    updatedAt,
  }: ParticipantWithDto): Participant {
    return new Participant(
      id,
      inscriptionId,
      typeInscriptionId,
      name,
      birthDate,
      gender,
      createdAt,
      updatedAt,
      preferredName,
      shirtSize,
      shirtType,
      cpf,
    );
  }
  // Getters
  public getInscriptionId(): string {
    return this.inscriptionId;
  }

  public getTypeInscriptionId(): string {
    return this.typeInscriptionId;
  }

  public getName(): string {
    return this.name;
  }

  public getPreferredName(): string | undefined {
    return this.preferredName;
  }

  public getShirtSize(): ShirtSize | undefined {
    return this.shirtSize;
  }

  public getShirtType(): ShirtType | undefined {
    return this.shirtType;
  }

  public getBirthDate(): Date {
    return this.birthDate;
  }

  public getCpf(): string | undefined {
    return this.cpf;
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

  public setName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
    this.validate();
  }

  public setBirthDate(birthDate: Date): void {
    this.birthDate = birthDate;
    this.updatedAt = new Date();
    this.validate();
  }

  public setGender(gender: genderType): void {
    this.gender = gender;
    this.updatedAt = new Date();
    this.validate();
  }

  public setTypeInscription(typeInscription: string): void {
    this.typeInscriptionId = typeInscription;
    this.updatedAt = new Date();
    this.validate();
  }

  public update({
    name,
    birthDate,
    gender,
    preferredName,
    shirtSize,
    shirtType,
  }: {
    name?: string;
    birthDate?: Date;
    gender?: genderType;
    preferredName?: string;
    shirtSize?: ShirtSize;
    shirtType?: ShirtType;
  }): void {
    if (name !== undefined) {
      this.setName(name);
    }
    if (birthDate !== undefined) {
      this.setBirthDate(birthDate);
    }
    if (gender !== undefined) {
      this.setGender(gender);
    }
    if (preferredName !== undefined) {
      this.preferredName = preferredName;
    }
    if (shirtSize !== undefined) {
      this.shirtSize = shirtSize;
    }
    if (shirtType !== undefined) {
      this.shirtType = shirtType;
    }
    this.updatedAt = new Date();
    this.validate();
  }

  protected validate(): void {
    ParticipantValidatorFactory.create().validate(this);
  }
}
