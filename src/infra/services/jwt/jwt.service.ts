export type GenerateAuthTokenWithRefreshTokenOutput = {
  authToken: string;
  userId: string;
};

export type JwtAuthPayload = {
  userId: string;
};

export type JwtRefreshPayload = {
  userId: string;
};

export abstract class JwtService {
  public abstract generateAuthToken(userId: string): string;
  public abstract genereteRefreshToken(userId: string): string;
  public abstract generateAuthTokenWithRefreshToken(
    refreshAuthToken: string,
  ): GenerateAuthTokenWithRefreshTokenOutput;
  public abstract verifyAuthToken(token: string): JwtAuthPayload;
}
