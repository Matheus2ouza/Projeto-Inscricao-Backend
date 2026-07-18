import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { Usecase } from 'src/usecases/usecase';
import { CredentialsNoValidUsecaseException } from 'src/usecases/web/exceptions/accounts/credentials-no-valid.usecase.exception';

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
    private readonly UserGateway: AccountGateway,
    private readonly jwtService: JwtService,
  ) {}

  public async execute({
    username,
    password,
  }: loginUserInput): Promise<loginUserOutput> {
    const anUser = await this.UserGateway.verifyActiveAccount(username);

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
        `Usuário ou senha inválidos`,
        LoginUserUsecase.name,
      );
    }

    const authToken = this.jwtService.generateAuthToken(
      anUser.getId(),
      anUser.getRole(),
      anUser.getRegionId(),
    );
    const refreshToken = this.jwtService.genereteRefreshToken(anUser.getId());

    return {
      authToken,
      refreshToken,
    };
  }
}
