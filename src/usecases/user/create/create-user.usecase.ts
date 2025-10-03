import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { User } from 'src/domain/entities/user.entity';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { UserAlreadyExistsUsecaseException } from 'src/usecases/exceptions/user-already-exists.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreateUserInput = {
  username: string;
  password: string;
  role: roleType;
};

export type CreateUserOutput = {
  id: string;
};

@Injectable()
export class CreateUserUsecase
  implements Usecase<CreateUserInput, CreateUserOutput>
{
  public constructor(private readonly userGatway: UserGateway) {}

  public async execute({
    username,
    password,
    role,
  }: CreateUserInput): Promise<CreateUserOutput> {
    const userExists = await this.userGatway.findByUser(username);

    if (userExists) {
      throw new UserAlreadyExistsUsecaseException(
        `User already exists while creating user with user: ${username}`,
        `A usuario ${username} já existe`,
        CreateUserUsecase.name,
      );
    }

    const anUser = User.create({ username, password, role });

    await this.userGatway.create(anUser);

    const output: CreateUserOutput = {
      id: anUser.getId(),
    };

    return output;
  }
}
