import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { CredentialsNoValidUsecaseException } from 'src/usecases/exceptions/credentials-no-valid.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type loginUserInput = {
  username: string;
  password: string;
};

export type loginUserOutput = {
  authToken: string;
  refreshToken: string;
  role: string;
};

@Injectable()
export class LoginUserUsecase
  implements Usecase<loginUserInput, loginUserOutput>
{
  public constructor(
    private readonly UserGateway: UserGateway,
    private readonly jwtService: JwtService,
  ) {}

  public async execute({
    username,
    password,
  }: loginUserInput): Promise<loginUserOutput> {
    const anUser = await this.UserGateway.findByUser(username);

    if (!anUser) {
      throw new CredentialsNoValidUsecaseException(
        `User not found with login user with User: ${username} in ${LoginUserUsecase.name}`,
        `Nenhum usuário encontrado`,
        LoginUserUsecase.name,
      );
    }

    const isValidPassword = anUser.comparePassword(password);

    if (!isValidPassword) {
      throw new CredentialsNoValidUsecaseException(
        `Password ${password} is not valid for user with user: ${username} and id ${anUser.getId()} in ${LoginUserUsecase.name}`,
        `Usuario ou senha inválidos`,
        LoginUserUsecase.name,
      );
    }

    const authToken = this.jwtService.generateAuthToken(
      anUser.getId(),
      anUser.getRole(),
    );
    const refreshToken = this.jwtService.genereteRefreshToken(anUser.getId());

    const Output: loginUserOutput = {
      authToken,
      refreshToken,
      role: anUser.getRole(),
    };

    return Output;
  }
}
