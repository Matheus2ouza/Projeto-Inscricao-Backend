import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { User } from 'src/domain/entities/user.entity';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { RegionNotFoundUsecaseException } from 'src/usecases/exceptions/users/region-not-found.usecase.exception';
import { UserAlreadyExistsUsecaseException } from 'src/usecases/exceptions/users/user-already-exists.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreateUserInput = {
  username: string;
  password: string;
  role: roleType;
  regionId?: string;
  requesterRole?: string;
  email: string;
};

export type CreateUserOutput = {
  id: string;
};

@Injectable()
export class CreateUserUsecase
  implements Usecase<CreateUserInput, CreateUserOutput>
{
  public constructor(private readonly userGateway: UserGateway) {}

  public async execute({
    username,
    password,
    role,
    regionId,
    requesterRole,
    email,
  }: CreateUserInput): Promise<CreateUserOutput> {
    // Verifica se o usuário que está tentando criar tem permissão para criar um usuário com a role desejada

    if (regionId) {
      const regionExists = await this.userGateway.findRegionById(regionId);
      if (!regionExists) {
        throw new RegionNotFoundUsecaseException(
          `Region with id ${regionId} does not exist`,
          `A região com id ${regionId} não existe`,
          CreateUserUsecase.name,
        );
      }
    }

    // Verifica se o usuário já existe
    const userExists = await this.userGateway.findByUser(username);

    if (userExists) {
      throw new UserAlreadyExistsUsecaseException(
        `User already exists while creating user with user: ${username}`,
        `A usuario ${username} já existe`,
        CreateUserUsecase.name,
      );
    }

    const anUser = User.create({ username, password, role, regionId, email });

    await this.userGateway.create(anUser);

    const output: CreateUserOutput = {
      id: anUser.getId(),
    };

    return output;
  }
}
