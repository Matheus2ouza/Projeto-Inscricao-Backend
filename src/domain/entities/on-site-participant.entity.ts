import { genderType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type OnSiteParticipantCreateDto = {
  onSiteRegistrationId: string;
  name: string;
  gender: genderType;
};

export type OnSiteParticipantWithDto = {
  id: string;
  onSiteRegistrationId: string;
  name: string;
  gender: genderType;
  createdAt: Date;
  updatedAt: Date;
};

export class OnSiteParticipant extends Entity {
  private constructor(
    id: string,
    private onSiteRegistrationId: string,
    private name: string,
    private gender: genderType,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    onSiteRegistrationId,
    name,
    gender,
  }: OnSiteParticipantCreateDto): OnSiteParticipant {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new OnSiteParticipant(
      id,
      onSiteRegistrationId,
      name,
      gender,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    onSiteRegistrationId,
    name,
    gender,
    createdAt,
    updatedAt,
  }: OnSiteParticipantWithDto): OnSiteParticipant {
    return new OnSiteParticipant(
      id,
      onSiteRegistrationId,
      name,
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

    if (!this.gender) {
      throw new Error('O gênero é obrigatório.');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getOnSiteRegistrationId(): string {
    return this.onSiteRegistrationId;
  }

  public getName(): string {
    return this.name;
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
