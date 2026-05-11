import { Utils } from 'src/shared/utils/utils';
import { ExclusiveInscriptionLinkTypeValidatorFactory } from '../factories/exclusive-inscription-link-type/exclusive-inscription-link-type.factory';
import { Entity } from '../shared/entities/entity';

export type ExclusiveInscriptionLinkTypeCreateDto = {
  exclusiveLinkId: string;
  typeInscriptionId: string;
};

export type ExclusiveInscriptionLinkTypeWithDto = {
  id: string;
  exclusiveLinkId: string;
  typeInscriptionId: string;
  createdAt: Date;
};

export class ExclusiveInscriptionLinkType extends Entity {
  private constructor(
    id: string,
    private exclusiveLinkId: string,
    private typeInscriptionId: string,
    createdAt: Date,
  ) {
    super(id, createdAt, createdAt);
    this.validate();
  }

  public static create({
    exclusiveLinkId,
    typeInscriptionId,
  }: ExclusiveInscriptionLinkTypeCreateDto): ExclusiveInscriptionLinkType {
    const id = Utils.generateUUID();
    const createdAt = new Date();

    return new ExclusiveInscriptionLinkType(
      id,
      exclusiveLinkId,
      typeInscriptionId,
      createdAt,
    );
  }

  public static with({
    id,
    exclusiveLinkId,
    typeInscriptionId,
    createdAt,
  }: ExclusiveInscriptionLinkTypeWithDto): ExclusiveInscriptionLinkType {
    return new ExclusiveInscriptionLinkType(
      id,
      exclusiveLinkId,
      typeInscriptionId,
      createdAt,
    );
  }

  protected validate(): void {
    ExclusiveInscriptionLinkTypeValidatorFactory.create().validate(this);
  }

  public getId(): string {
    return this.id;
  }

  public getExclusiveLinkId(): string {
    return this.exclusiveLinkId;
  }

  public getTypeInscriptionId(): string {
    return this.typeInscriptionId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
