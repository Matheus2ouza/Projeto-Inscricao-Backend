import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type ParticipantCreateDto = {
  inscriptionId: string;
  typeInscriptionId: string;
  name: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate: Date;
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
    typeInscriptionId,
  }: {
    name?: string;
    birthDate?: Date;
    gender?: genderType;
    typeInscriptionId: string;
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
    if (typeInscriptionId !== undefined) {
      this.setTypeInscription(typeInscriptionId);
    }
  }

  protected validate(): void {
    if (!this.inscriptionId) {
      throw new Error('Id da Inscrição é obrigatório');
    }

    if (!this.typeInscriptionId) {
      throw new Error('Id do Tipo de Inscrição é obrigatório');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Nome do participante é obrigatório');
    }

    if (!this.birthDate) {
      throw new Error('Data de nascimento é obrigatória');
    }

    if (this.birthDate > new Date()) {
      throw new Error('Data de nascimento não pode ser futura');
    }

    if (!this.gender || this.gender.trim().length === 0) {
      throw new Error('Gênero é obrigatório');
    }
  }
}
