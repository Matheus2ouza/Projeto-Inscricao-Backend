import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { CredentialsNoValidUsecaseException } from 'src/usecases/exceptions/users/credentials-no-valid.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type RefreshAuthTokenUserUsecaseInput = {
  refreshToken: string;
};

export type RefreshAuthTokenUserUsecaseOutput = {
  authToken: string;
};

@Injectable()
export class RefreshAuthTokenUserUsecase
  implements
    Usecase<RefreshAuthTokenUserUsecaseInput, RefreshAuthTokenUserUsecaseOutput>
{
  public constructor(
    private readonly userGateway: UserGateway,
    private readonly jwtService: JwtService,
  ) {}

  public async execute({
    refreshToken,
  }: RefreshAuthTokenUserUsecaseInput): Promise<RefreshAuthTokenUserUsecaseOutput> {
    const { authToken, userId } =
      await this.jwtService.generateAuthTokenWithRefreshToken(refreshToken);

    const anLocality = await this.userGateway.findById(userId);

    if (!anLocality) {
      throw new CredentialsNoValidUsecaseException(
        `User with id ${userId} not found while refreshing auth token with refresh token ${refreshToken} in ${RefreshAuthTokenUserUsecase.name}`,
        `Credenciais inválidas`,
        RefreshAuthTokenUserUsecase.name,
      );
    }

    const Output: RefreshAuthTokenUserUsecaseOutput = {
      authToken,
    };

    return Output;
  }
}
