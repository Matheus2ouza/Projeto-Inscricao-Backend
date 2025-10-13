import { genderType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type ParticipantCreateDto = {
  inscriptionId: string;
  typeInscriptionId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
};

export type ParticipantWithDto = {
  id: string;
  inscriptionId: string;
  typeInscriptionId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  createdAt: Date;
  updatedAt: Date;
  typeInscriptionDescription?: string;
};

export class Participant extends Entity {
  private typeInscriptionDescription?: string;
  private constructor(
    id: string,
    private inscriptionId: string,
    private typeInscriptionId: string,
    private name: string,
    private birthDate: Date,
    private gender: genderType,
    createdAt: Date,
    updatedAt: Date,
    typeInscriptionDescription?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.typeInscriptionDescription = typeInscriptionDescription;
    this.validate();
  }

  public static create({
    inscriptionId,
    typeInscriptionId,
    name,
    birthDate,
    gender,
  }: ParticipantCreateDto) {
    const id = Utils.generateUUID();
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
    );
  }

  public static with({
    id,
    inscriptionId,
    typeInscriptionId,
    name,
    birthDate,
    gender,
    createdAt,
    updatedAt,
    typeInscriptionDescription,
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
      typeInscriptionDescription,
    );
  }
  // Getters
  public getTypeInscriptionDescription(): string | undefined {
    return this.typeInscriptionDescription;
  }

  public getInscriptionId(): string {
    return this.inscriptionId;
  }

  public getTypeInscriptionId(): string {
    return this.typeInscriptionId;
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
