import Decimal from 'decimal.js';
import { genderType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type OnSiteParticipantCreateDto = {
  onSiteRegistrationId: string;
  value: Decimal;
  name: string;
  birthDate: Date;
  gender: genderType;
};

export type OnSiteParticipantWithDto = {
  id: string;
  onSiteRegistrationId: string;
  value: Decimal;
  name: string;
  birthDate: Date;
  gender: genderType;
  createdAt: Date;
  updatedAt: Date;
};

export class OnSiteParticipant extends Entity {
  private constructor(
    id: string,
    private onSiteRegistrationId: string,
    private value: Decimal,
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
    onSiteRegistrationId,
    value,
    name,
    birthDate,
    gender,
  }: OnSiteParticipantCreateDto): OnSiteParticipant {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new OnSiteParticipant(
      id,
      onSiteRegistrationId,
      value,
      name,
      birthDate,
      gender,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    onSiteRegistrationId,
    value,
    name,
    birthDate,
    gender,
    createdAt,
    updatedAt,
  }: OnSiteParticipantWithDto): OnSiteParticipant {
    return new OnSiteParticipant(
      id,
      onSiteRegistrationId,
      value,
      name,
      birthDate,
      gender,
      createdAt,
      updatedAt,
    );
  }

  public validate(): void {
    if (!this.onSiteRegistrationId) {
      throw new Error('O ID da inscrição presencial é obrigatório.');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('O nome do participante é obrigatório.');
    }

    if (!this.birthDate) {
      throw new Error('A data de nascimento é obrigatória.');
    }

    if (!this.gender) {
      throw new Error('O gênero é obrigatório.');
    }

    if (!this.value || this.value.lessThan(0)) {
      throw new Error('O valor deve ser maior ou igual a zero.');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getOnSiteRegistrationId(): string {
    return this.onSiteRegistrationId;
  }

  public getValue(): Decimal {
    return this.value;
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
