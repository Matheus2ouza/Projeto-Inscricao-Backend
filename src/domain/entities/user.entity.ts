import { roleType } from 'generated/prisma';
import { Utils } from 'src/shared/utils/utils';
import { UserPasswordZodValidatorFactory } from '../factories/user-password.validator.factory';
import { UserValidatorFactory } from '../factories/user.validator.factory';
import { Entity } from '../shared/entities/entity';

export type UserCreateDto = {
  username: string;
  password: string;
  role: roleType;
  regionId?: string;
  email: string;
};

export type UserwithDto = {
  id: string;
  username: string;
  password: string;
  role: roleType;
  createdAt: Date;
  updatedAt: Date;
  regionId?: string;
  regionName?: string;
  email?: string;
};

export class User extends Entity {
  private constructor(
    id: string,
    private username: string,
    private password: string,
    private role: roleType,
    createdAt: Date,
    updatedAt: Date,
    private regionId?: string,
    private regionName?: string,
    private email?: string,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({
    username,
    password,
    role,
    regionId,
    email,
  }: UserCreateDto): User {
    const id = Utils.generateUUID();

    UserPasswordZodValidatorFactory.create().validate(password);

    const encryptedPassword = Utils.encryptPassword(password);
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(
      id,
      username,
      encryptedPassword,
      role,
      createdAt,
      updatedAt,
      regionId,
      email,
    );
  }

  public static with({
    id,
    username,
    password,
    role,
    createdAt,
    updatedAt,
    regionId,
    regionName,
    email,
  }: UserwithDto): User {
    return new User(
      id,
      username,
      password,
      role,
      createdAt,
      updatedAt,
      regionId,
      regionName,
      email,
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

  public getRole(): roleType {
    return this.role;
  }

  public getRegionId(): string | undefined {
    return this.regionId;
  }

  public getRegionName(): string | undefined {
    return this.regionName;
  }

  public getEmail(): string | undefined {
    return this.email;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
