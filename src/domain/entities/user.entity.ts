import { Utils } from 'src/shared/utils/utils';
import { Entity } from '../shared/entities/entity';
import { UserValidatorFactory } from '../factories/user.validator.factory';
import { UserPasswordZodValidatorFactory } from '../factories/user-password.validator.factory';

export type UserCreateDto = {
  locality: string;
  password: string;
};

export class User extends Entity {
  private constructor(
    id: string,
    private locality: string,
    private password: string,
    private role: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({ locality, password }: UserCreateDto): User {
    const id = Utils.generateUUID();

    UserPasswordZodValidatorFactory.create().validate(password);

    const encryptedPassword = Utils.encryptPassword(password);
    const role = 'user'; // Default role
    const createdAt = new Date();
    const updatedAt = new Date();

    return new User(
      id,
      locality,
      encryptedPassword,
      role,
      createdAt,
      updatedAt,
    );
  }

  protected validate(): void {
    UserValidatorFactory.create().validate(this);
  }

  public getLocality(): string {
    return this.locality;
  }
  public getPassword(): string {
    return this.password;
  }

  public getRole(): string {
    return this.role;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }
}
