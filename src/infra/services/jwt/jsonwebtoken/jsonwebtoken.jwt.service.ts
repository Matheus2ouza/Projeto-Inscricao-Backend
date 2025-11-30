import { Injectable } from '@nestjs/common';
import * as jsonwebToken from 'jsonwebtoken';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { AuthTokenNotValidServiceException } from '../../exceptions/auth-token-not-valid.service.exception';
import { RefreshTokenNotValidServiceException } from '../../exceptions/refresh-token-not-valid.service.exception';
import { ServiceException } from '../../exceptions/service.exception';
import {
  GenerateAuthTokenWithRefreshTokenOutput,
  JwtAuthPayload,
  JwtRefreshPayload,
  JwtService,
} from '../jwt.service';

@Injectable()
export class JsonWebTokenService extends JwtService {
  private authSecret: string;
  private refreshSecret: string;

  public constructor(private readonly userGateway: AccountGateway) {
    super();

    if (!process.env.JWT_AUTH_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new ServiceException(
        `JWT_AUTH_SECRECT or JWT_REFRESH_SECRET not set in environment variables while initializing ${JsonWebTokenService.name}`,
        `Erro interno do servidor, Tente novamente mais tarde`,
        JsonWebTokenService.name,
      );
    }

    this.authSecret = process.env.JWT_AUTH_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  public generateAuthToken(
    userId: string,
    role: string,
    regionId?: string,
  ): string {
    const payload = this.generateAuthTokenPayload(userId, role, regionId);

    const token = jsonwebToken.sign(payload, this.authSecret, {
      expiresIn: '1h',
    });

    return token;
  }

  private generateAuthTokenPayload(
    userId: string,
    role: string,
    regionId?: string,
  ): JwtAuthPayload {
    const payload: JwtAuthPayload = {
      userId,
      role,
    };

    if (regionId) {
      payload.regionId = regionId;
    }

    return payload;
  }

  public genereteRefreshToken(userId: string): string {
    const payload = this.generateRefreshTokenPayload(userId);

    const token = jsonwebToken.sign(payload, this.refreshSecret, {
      expiresIn: '1d',
    });

    return token;
  }

  private generateRefreshTokenPayload(userId: string): JwtRefreshPayload {
    const payload: JwtRefreshPayload = {
      userId,
    };

    return payload;
  }

  public async generateAuthTokenWithRefreshToken(
    refreshToken: string,
  ): Promise<GenerateAuthTokenWithRefreshTokenOutput> {
    try {
      const payload = jsonwebToken.verify(
        refreshToken,
        this.refreshSecret,
      ) as JwtRefreshPayload;

      const userId = payload.userId;

      // Buscar o role do usuário para incluir no novo authToken
      const user = await this.userGateway.findById(userId);
      if (!user) {
        throw new RefreshTokenNotValidServiceException(
          `User with id ${userId} not found while refreshing auth token in ${JsonWebTokenService.name}`,
          `Credenciais inválidas. Faça o login novamente`,
          JsonWebTokenService.name,
        );
      }

      const authToken = this.generateAuthToken(
        userId,
        user.getRole(),
        user.getRegionId(),
      );

      const output: GenerateAuthTokenWithRefreshTokenOutput = {
        authToken,
        userId,
        role: user.getRole(),
        regionId: user.getRegionId() ?? undefined,
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

  public verifyAuthToken(token: string): JwtAuthPayload {
    try {
      const payload = jsonwebToken.verify(
        token,
        this.authSecret,
      ) as JwtAuthPayload;

      return payload;
    } catch (error) {
      throw new AuthTokenNotValidServiceException(
        `Auth token ${token} not valid while verifying in ${JsonWebTokenService.name}`,
        `Credenciais inválidas. Faça o login novamente`,
        JsonWebTokenService.name,
      );
    }
  }
}
