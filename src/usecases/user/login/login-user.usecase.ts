import { Injectable } from '@nestjs/common';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { CredentialsNoValidUsecaseException } from 'src/usecases/exceptions/users/credentials-no-valid.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type loginUserInput = {
  username: string;
  password: string;
};

export type loginUserOutput = {
  authToken: string;
  refreshToken: string;
  user: User;
};

export type User = {
  id: string;
  username: string;
  role: string;
  email: string | null;
  region: Region | null;
  image: string | null;
};

export type Region = {
  id: string;
  Name: string;
};

@Injectable()
export class LoginUserUsecase
  implements Usecase<loginUserInput, loginUserOutput>
{
  public constructor(
    private readonly UserGateway: UserGateway,
    private readonly jwtService: JwtService,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly regionGateway: RegionGateway,
  ) {}

  public async execute({
    username,
    password,
  }: loginUserInput): Promise<loginUserOutput> {
    const anUser = await this.UserGateway.findByUser(username);

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

    //Pega o avatar no usuario, caso ele tenha
    let image: string | null = null;
    const imagePath = anUser.getImage();

    if (imagePath) {
      try {
        const publicUrl =
          await this.supabaseStorageService.getPublicUrl(imagePath);
        image = publicUrl || null;
      } catch (error) {
        image = null;
      }
    }

    //Pega os dados da região caso que o usuario é vinculado, caso ele seja
    let region: Region | null = null;

    if (anUser.getRole() !== 'SUPER') {
      const regionId = anUser.getRegionId();
      if (regionId) {
        try {
          const foundRegion = await this.regionGateway.findById(regionId);
          if (foundRegion) {
            region = {
              id: foundRegion.getId(),
              Name: foundRegion.getName(),
            };
          }
        } catch {
          region = null;
        }
      }
    }

    const authToken = this.jwtService.generateAuthToken(
      anUser.getId(),
      anUser.getRole(),
    );
    const refreshToken = this.jwtService.genereteRefreshToken(anUser.getId());

    return {
      authToken,
      refreshToken,
      user: {
        id: anUser.getId(),
        username: anUser.getUsername(),
        role: anUser.getRole(),
        email: anUser.getEmail() ?? null,
        region: region,
        image,
      },
    };
  }
}
