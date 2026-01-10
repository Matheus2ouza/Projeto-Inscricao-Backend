import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';

export type AccountParticipantInEventCreateDto = {
  accountParticipantId: string;
  inscriptionId: string;
  typeInscriptionId: string;
};

export type AccountParticipantInEventWithDto = {
  id: string;
  accountParticipantId: string;
  inscriptionId: string;
  typeInscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AccountParticipantInEvent extends Entity {
  private constructor(
    id: string,
    private accountParticipantId: string,
    private inscriptionId: string,
    private typeInscriptionId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    accountParticipantId,
    inscriptionId,
    typeInscriptionId,
  }: AccountParticipantInEventCreateDto): AccountParticipantInEvent {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new AccountParticipantInEvent(
      id,
      accountParticipantId,
      inscriptionId,
      typeInscriptionId,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    accountParticipantId,
    inscriptionId,
    typeInscriptionId,
    createdAt,
    updatedAt,
  }: AccountParticipantInEventWithDto): AccountParticipantInEvent {
    return new AccountParticipantInEvent(
      id,
      accountParticipantId,
      inscriptionId,
      typeInscriptionId,
      createdAt,
      updatedAt,
    );
  }

  public validate(): void {
    if (!this.accountParticipantId) {
      throw new Error('AccountParticipantId is required');
    }
    if (!this.inscriptionId) {
      throw new Error('InscriptionId is required');
    }
    if (!this.typeInscriptionId) {
      throw new Error('TypeInscriptionId is required');
    }
  }

  public getId(): string {
    return this.id;
  }

  public getAccountParticipantId(): string {
    return this.accountParticipantId;
  }

  public getInscriptionId(): string {
    return this.inscriptionId;
  }

  public getTypeInscriptionId(): string {
    return this.typeInscriptionId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
