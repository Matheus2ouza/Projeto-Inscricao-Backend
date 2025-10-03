import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { UserNotFoundUsecaseException } from 'src/usecases/exceptions/users/user-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type FindUserInput = {
  id: string;
};

export type FindUserOutput = {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  regionId: string | undefined;
};

@Injectable()
export class FindUserUsecase implements Usecase<FindUserInput, FindUserOutput> {
  public constructor(private readonly userGateway: UserGateway) {}

  public async execute({ id }: FindUserInput): Promise<FindUserOutput> {
    const anUser = await this.userGateway.findById(id);

    if (!anUser) {
      throw new UserNotFoundUsecaseException(
        `User not found with finding user with id ${id} in ${FindUserUsecase.name}`,
        `Usuario não encontrado`,
        FindUserUsecase.name,
      );
    }
    const output: FindUserOutput = {
      id: anUser.getId(),
      username: anUser.getUsername(),
      role: anUser.getRole(),
      createdAt: anUser.getCreatedAt(),
      updatedAt: anUser.getUpdatedAt(),
      regionId: anUser.getRegionId(),
    };

    return output;
  }
}
