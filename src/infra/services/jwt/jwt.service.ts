export type GenerateAuthTokenWithRefreshTokenOutput = {
  authToken: string;
  userId: string;
  role: string;
};

export type JwtAuthPayload = {
  userId: string;
  role: string;
};

export type JwtRefreshPayload = {
  userId: string;
};

export abstract class JwtService {
  public abstract generateAuthToken(userId: string, role: string): string;
  public abstract genereteRefreshToken(userId: string): string;
  public abstract generateAuthTokenWithRefreshToken(
    refreshAuthToken: string,
  ): Promise<GenerateAuthTokenWithRefreshTokenOutput>;
  public abstract verifyAuthToken(token: string): JwtAuthPayload;
}
