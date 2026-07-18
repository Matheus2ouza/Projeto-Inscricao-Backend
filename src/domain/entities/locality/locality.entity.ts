import { UF } from 'generated/prisma';
import { LocalityValidatorFactory } from 'src/domain/factories/locality/locality.validator.factory';
import { Entity } from 'src/domain/shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';

export type LocalityCreateDto = {
  name: string;
  uf: UF;
  regionId: string;
};

export type LocalityWithDto = {
  id: string;
  name: string;
  uf: UF;
  regionId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LocalityUpdateDto = {
  name?: string;
  uf?: UF;
  regionId?: string;
};

export class Locality extends Entity {
  private constructor(
    id: string,
    private name: string,
    private uf: UF,
    private regionId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({ name, uf, regionId }: LocalityCreateDto): Locality {
    const id = Utils.generateUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Locality(id, name, uf, regionId, createdAt, updatedAt);
  }

  public static with({
    id,
    name,
    uf,
    regionId,
    createdAt,
    updatedAt,
  }: LocalityWithDto): Locality {
    return new Locality(id, name, uf, regionId, createdAt, updatedAt);
  }

  protected validate(): void {
    LocalityValidatorFactory.create().validate(this);
  }

  private touch(): void {
    this.updatedAt = new Date();
    this.validate();
  }

  // Getters
  public getName(): string {
    return this.name;
  }

  public getUf(): UF {
    return this.uf;
  }

  public getRegionId(): string {
    return this.regionId;
  }

  // Setters
  public setName(name: string): void {
    this.name = name;
    this.touch();
  }

  public setUf(uf: UF): void {
    this.uf = uf;
    this.touch();
  }

  public setRegionId(regionId: string): void {
    this.regionId = regionId;
    this.touch();
  }

  // Método para atualização em lote
  public update(data: LocalityUpdateDto): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.uf !== undefined) this.uf = data.uf;
    if (data.regionId !== undefined) this.regionId = data.regionId;

    this.touch();
  }
}
