import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';
import { UserValidatorFactory } from '../factories/user.validator.factory';
import { UserPasswordZodValidatorFactory } from '../factories/user-password.validator.factory';
import { roleType } from 'generated/prisma';

export type UserCreateDto = {
  username: string;
  password: string;
  role: roleType;
};

export type UserwithDto = {
  id: string;
  username: string;
  password: string;
  outstandingBalance: number;
  role: roleType;
  createdAt: Date;
  updatedAt: Date;
  regionId?: string;
};

export class User extends Entity {
  private constructor(
    id: string,
    private username: string,
    private password: string,
    private outstandingBalance: number,
    private role: roleType,
    createdAt: Date,
    updatedAt: Date,
    private regionId?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({ username, password, role }: UserCreateDto): User {
    const id = Utils.generateUUID();

    UserPasswordZodValidatorFactory.create().validate(password);

    const encryptedPassword = Utils.encryptPassword(password);
    const outstandingBalance = 0;
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(
      id,
      username,
      encryptedPassword,
      outstandingBalance,
      role,
      createdAt,
      updatedAt,
    );
  }

  public static with({
    id,
    username,
    password,
    outstandingBalance,
    role,
    createdAt,
    updatedAt,
    regionId,
  }: UserwithDto): User {
    return new User(
      id,
      username,
      password,
      outstandingBalance,
      role,
      createdAt,
      updatedAt,
      regionId,
    );
  }

  protected validate(): void {
    UserValidatorFactory.create().validate(this);
  }

  public getUsername(): string {
    return this.username;
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

  public getRegionId(): string | undefined {
    return this.regionId;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }
}
