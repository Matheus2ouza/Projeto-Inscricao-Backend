import { Injectable } from "@nestjs/common";
import { LocalityGateway } from "src/domain/repositories/locality.geteway";
import { JwtService } from "src/infra/services/jwt/jwt.service";
import { CredentialsNoValidUsecaseException } from "src/usecases/exceptions/credentials-no-valid.usecase.exception";
import { Usecase } from "src/usecases/usecase";

export type loginLocalityInput = {
  locality: string;
  password: string;
}

export type loginLocalityOutput = {
  authToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginLocalityUsecase implements Usecase<loginLocalityInput, loginLocalityOutput> {
  public constructor(
    private readonly LocalityGateway: LocalityGateway,
    private readonly jwtService: JwtService,
  ) {}

  public async execute({locality, password}: loginLocalityInput): Promise<loginLocalityOutput> {
    const anLocality = await this.LocalityGateway.findBylocality(locality);

    if (!anLocality) {
      throw new CredentialsNoValidUsecaseException(
        `Locality not found with login locality withlocality: ${locality} in ${LoginLocalityUsecase.name}`,
        `Credenciais inválidas`,
        LoginLocalityUsecase.name,
      )
    }

    const isValidPassword = anLocality.comparePassword(password);

    if (!isValidPassword) {
      throw new CredentialsNoValidUsecaseException(
        `Password ${password} is not valid for locality with locality: ${locality} and id ${anLocality.getId()} in ${LoginLocalityUsecase.name}`,
        `Credenciais inválidas`,
        LoginLocalityUsecase.name,
      )
    }
    
    const authToken = this.jwtService.generateAuthToken(anLocality.getId());
    const refreshToken = this.jwtService.genereteRefreshToken(anLocality.getId())

    const Output: loginLocalityOutput = {
      authToken,
      refreshToken
    }

    return Output;
  }
}