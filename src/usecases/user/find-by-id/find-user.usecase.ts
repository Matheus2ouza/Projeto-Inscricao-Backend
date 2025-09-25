import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { UserNotFoundUsecaseException } from 'src/usecases/exceptions/user-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type FindUserInput = {
  id: string;
};

export type FindUserOutput = {
  id: string;
  username: string;
  role: string;
  outstanding_balance: number;
  createdAt: Date;
  updatedAt: Date;
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
      outstanding_balance: anUser.getOutstandingBalance(),
      createdAt: anUser.getCreatedAt(),
      updatedAt: anUser.getUpdatedAt(),
    };

    return output;
  }
}
