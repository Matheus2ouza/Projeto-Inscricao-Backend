import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';
import { LocalityValidatorFactory } from '../factories/locality.validator.factory';
import { LocalityPasswordZodValidatorFactory } from '../factories/locality-password.validator.factory';
import { roleType } from 'generated/prisma'; // Importa o enum do Prisma

export type LocalityCreateDto = {
  locality: string;
  password: string;
};

export type LocalitywithDto = {
  id: string;
  locality: string;
  password: string;
  outstandingBalance: number;
  role: roleType;
  createdAt: Date,
  updatedAt: Date,
}

export class Locality extends Entity {
  private constructor(
    id: string,
    private locality: string,
    private password: string,
    private outstandingBalance: number,
    private role: roleType,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({ locality, password }: LocalityCreateDto): Locality {
    const id = Utils.generateUUID();

    LocalityPasswordZodValidatorFactory.create().validate(password);

    const encryptedPassword = Utils.encryptPassword(password);
    const outstandingBalance = 0;
    const role: roleType = roleType.USER;
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Locality(
      id,
      locality,
      encryptedPassword,
      outstandingBalance,
      role,
      createdAt,
      updatedAt,
    );
  }

  public static with({ 
    id,
    locality,
    password,
    outstandingBalance,
    role,
    createdAt,
    updatedAt
  }: LocalitywithDto): Locality {
    return new Locality(id, locality, password, outstandingBalance, role, createdAt, updatedAt)
  }

  protected validate(): void {
    LocalityValidatorFactory.create().validate(this);
  }

  public getLocality(): string {
    return this.locality;
  }

  public getPassword(): string {
    return this.password;
  }

  public getOutstandingBalance(): number {
    return this.outstandingBalance;
  }

  public getRole(): roleType {
    return this.role;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }
}
