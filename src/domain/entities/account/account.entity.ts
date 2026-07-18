import { roleType } from 'generated/prisma';
import { AccountPasswordZodValidatorFactory } from 'src/domain/factories/account/account-password.validator.factory';
import { AccountValidatorFactory } from 'src/domain/factories/account/account.validator.factory';
import { Entity } from 'src/domain/shared/entities/entity';
import { Utils } from 'src/shared/utils/utils';

export type AccountCreateDto = {
  username: string;
  password: string;
  role: roleType;
  regionId?: string;
  email?: string;
  imageUrl?: string;
};

export type AccountWithDto = {
  id: string;
  username: string;
  password: string;
  role: roleType;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  regionId?: string;
  email?: string;
  imageUrl?: string;
};

export class Account extends Entity {
  private constructor(
    id: string,
    private username: string,
    private password: string,
    private role: roleType,
    private active: boolean,
    createdAt: Date,
    updatedAt: Date,
    private regionId?: string,
    private email?: string,
    private imageUrl?: string,
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
    imageUrl,
  }: AccountCreateDto): Account {
    const id = Utils.generateUUID();

    AccountPasswordZodValidatorFactory.create().validate(password);

    const encryptedPassword = Utils.encryptPassword(password);
    const active = true;
    const createdAt = new Date();
    const updatedAt = new Date();

    return new Account(
      id,
      username,
      encryptedPassword,
      role,
      active,
      createdAt,
      updatedAt,
      regionId,
      email,
      imageUrl,
    );
  }

  public static with({
    id,
    username,
    password,
    role,
    active,
    createdAt,
    updatedAt,
    regionId,
    email,
    imageUrl,
  }: AccountWithDto): Account {
    return new Account(
      id,
      username,
      password,
      role,
      active,
      createdAt,
      updatedAt,
      regionId,
      email,
      imageUrl,
    );
  }

  protected validate(): void {
    AccountValidatorFactory.create().validate(this);
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

  public getActive(): boolean {
    return this.active;
  }

  public getRegionId(): string | undefined {
    return this.regionId;
  }

  public getEmail(): string | undefined {
    return this.email;
  }

  public getImage(): string | undefined {
    return this.imageUrl;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }
}
