import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedUsersInput = {
  page: number;
  pageSize: number;
  regionId?: string;
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
  public constructor(
    private readonly userGateway: AccountGateway,
    private readonly regionGateway: RegionGateway,
  ) {}

  public async execute(
    input: FindAllPaginatedUsersInput,
  ): Promise<FindAllPaginatedUsersOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(100, Math.floor(input.pageSize || 10)),
    );

    const regionId = input.regionId;

    const [anUsers, total] = await Promise.all([
      this.userGateway.findManyPaginated(safePage, safePageSize, regionId),
      this.userGateway.countAll(regionId),
    ]);

    const users = await Promise.all(
      anUsers.map(async (user) => {
        const regionId = user.getRegionId();
        const region = regionId
          ? await this.regionGateway.findById(regionId)
          : undefined;

        return {
          id: user.getId(),
          username: user.getUsername(),
          role: user.getRole(),
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt(),
          regionName: region?.getName(),
        };
      }),
    );

    const pageCount = Math.max(1, Math.ceil(total / safePageSize));

    return {
      users,
      total,
      page: safePage,
      pageCount,
    };
  }
}
