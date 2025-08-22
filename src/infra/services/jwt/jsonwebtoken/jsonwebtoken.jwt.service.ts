import * as jsonwebToken from 'jsonwebtoken';
import { ServiceException } from '../../exceptions/service.exception';
import {
  GenerateAuthTokenWithRefreshTokenOutput,
  JwtAuthPayload,
  JwtRefreshPayload,
  JwtService,
} from '../jwt.service';
import { RefreshTokenNotValidServiceException } from '../../exceptions/refresh-token-not-valid.service.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonWebTokenService extends JwtService {
  private authSecret: string;
  private refreshSecret: string;

  public constructor() {
    super();

    if (!process.env.JWT_AUTH_SECRECT || !process.env.JWT_REFRESH_SECRET) {
      throw new ServiceException(
        `JWT_AUTH_SECRECT or JWT_REFRESH_SECRET not set in environment variables while initializing ${JsonWebTokenService.name}`,
        `Erro interno do servidor, Tente novamente mais tarde`,
        JsonWebTokenService.name,
      );
    }

    this.authSecret = process.env.JWT_AUTH_SECRECT;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  public generateAuthToken(localityId: string): string {
    const payload = this.generateAuthTokenPayload(localityId);

    const token = jsonwebToken.sign(payload, this.authSecret, {
      expiresIn: '1h',
    });

    return token;
  }

  private generateAuthTokenPayload(localityId: string): JwtAuthPayload {
    const payload: JwtAuthPayload = {
      localityId,
    };

    return payload;
  }

  public genereteRefreshToken(localityId: string): string {
    const payload = this.generateRefreshTokenPayload(localityId);

    const token = jsonwebToken.sign(payload, this.refreshSecret, {
      expiresIn: '1d',
    });

    return token;
  }

  private generateRefreshTokenPayload(localityId: string): JwtRefreshPayload {
    const payload: JwtRefreshPayload = {
      localityId,
    };

    return payload;
  }

  public generateAuthTokenWithRefreshToken(
    refreshToken: string,
  ): GenerateAuthTokenWithRefreshTokenOutput {
    try {
      const payload = jsonwebToken.verify(
        refreshToken,
        this.refreshSecret,
      ) as JwtRefreshPayload;

      const localityId = payload.localityId;

      const authToken = this.generateAuthToken(localityId);

      const output: GenerateAuthTokenWithRefreshTokenOutput = {
        authToken,
        localityId,
      };

      return output;
    } catch (error) {
      if (error instanceof jsonwebToken.JsonWebTokenError) {
        throw new RefreshTokenNotValidServiceException(
          `Refresh Token ${refreshToken} expired while refresh auth token in ${JsonWebTokenService.name}`,
          `Credenciais inválidas. Faça o login novamente`,
          JsonWebTokenService.name,
        );
      }

      throw new RefreshTokenNotValidServiceException(
        `Refresh token ${refreshToken} not valid while refresh auth token in ${JsonWebTokenService.name}`,
        `Credenciais inválidas`,
        JsonWebTokenService.name,
      );
    }
  }
}
