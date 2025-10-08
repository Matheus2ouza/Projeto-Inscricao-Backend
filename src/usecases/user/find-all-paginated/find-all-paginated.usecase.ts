import { Injectable } from '@nestjs/common';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedUsersInput = {
  page: number;
  pageSize: number;
};

export type FindAllPaginatedUsersOutput = {
  users: {
    id: string;
    username: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    regionName: string | undefined;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class FindAllPaginatedUsersUsecase
  implements Usecase<FindAllPaginatedUsersInput, FindAllPaginatedUsersOutput>
{
  public constructor(private readonly userGateway: UserGateway) {}

  public async execute(
    input: FindAllPaginatedUsersInput,
  ): Promise<FindAllPaginatedUsersOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(100, Math.floor(input.pageSize || 10)),
    );

    const [models, total] = await Promise.all([
      this.userGateway.findManyPaginated(safePage, safePageSize),
      this.userGateway.countAll(),
    ]);

    const users = models.map((anUser) => ({
      id: anUser.getId(),
      username: anUser.getUsername(),
      role: anUser.getRole(),
      createdAt: anUser.getCreatedAt(),
      updatedAt: anUser.getUpdatedAt(),
      regionName: anUser.getRegionName(),
    }));

    const pageCount = Math.max(1, Math.ceil(total / safePageSize));

    return {
      users,
      total,
      page: safePage,
      pageCount,
    };
  }
}
