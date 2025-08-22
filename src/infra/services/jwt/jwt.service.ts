export type GenerateAuthTokenWithRefreshTokenOutput = {
  authToken: string;
  localityId: string;
}

export type JwtAuthPayload = {
  localityId: string;
}

export type JwtRefreshPayload = {
  localityId: string;
}

export abstract class JwtService {
  public abstract generateAuthToken(localityId: string): string;
  public abstract genereteRefreshToken(localityId: string): string;
  public abstract generateAuthTokenWithRefreshToken(
    refreshAuthToken: string
  ): GenerateAuthTokenWithRefreshTokenOutput;
}
