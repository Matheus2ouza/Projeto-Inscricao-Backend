import { Injectable } from '@nestjs/common';
import { USerGateway } from 'src/domain/repositories/user.geteway';
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
};

@Injectable()
export class LoginUserUsecase
  implements Usecase<loginUserInput, loginUserOutput>
{
  public constructor(
    private readonly UserGateway: USerGateway,
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
        `Credenciais inválidas`,
        LoginUserUsecase.name,
      );
    }

    const isValidPassword = anUser.comparePassword(password);

    if (!isValidPassword) {
      throw new CredentialsNoValidUsecaseException(
        `Password ${password} is not valid for user with user: ${username} and id ${anUser.getId()} in ${LoginUserUsecase.name}`,
        `Credenciais inválidas`,
        LoginUserUsecase.name,
      );
    }

    const authToken = this.jwtService.generateAuthToken(anUser.getId());
    const refreshToken = this.jwtService.genereteRefreshToken(anUser.getId());

    const Output: loginUserOutput = {
      authToken,
      refreshToken,
    };

    return Output;
  }
}
