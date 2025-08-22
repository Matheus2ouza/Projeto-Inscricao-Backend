import { Injectable } from "@nestjs/common";
import { LocalityGateway } from "src/domain/repositories/locality.geteway";
import { JwtService } from "src/infra/services/jwt/jwt.service";
import { CredentialsNoValidUsecaseException } from "src/usecases/exceptions/credentials-no-valid.usecase.exception";
import { Usecase } from "src/usecases/usecase";

export type RefreshAuthTokenLocalityUsecaseInput = {
  refreshToken: string;
}

export type RefreshAuthTokenLocalityUsecaseOutput = {
  authToken: string;
}

@Injectable()
export class RefreshAuthTokenLocalityUsecase implements Usecase<RefreshAuthTokenLocalityUsecaseInput, RefreshAuthTokenLocalityUsecaseOutput> {
  public constructor(
    private readonly localityGateway: LocalityGateway,
    private readonly jwtService: JwtService,
  ) {}

  public async execute({
    refreshToken
  }: RefreshAuthTokenLocalityUsecaseInput): Promise<RefreshAuthTokenLocalityUsecaseOutput> {
    const {authToken, localityId} = 
      this.jwtService.generateAuthTokenWithRefreshToken(refreshToken)

    const anLocality = await this.localityGateway.findById(localityId);

    if (!anLocality) {
      throw new CredentialsNoValidUsecaseException(
        `Locality with id ${localityId} not found while refreshing auth token with refresh token ${refreshToken} in ${RefreshAuthTokenLocalityUsecase.name}`,
        `Credenciais inválidas`,
        RefreshAuthTokenLocalityUsecase.name,
      )
    }

    const Output: RefreshAuthTokenLocalityUsecaseOutput = {
      authToken,
    }

    return Output;
  }
}