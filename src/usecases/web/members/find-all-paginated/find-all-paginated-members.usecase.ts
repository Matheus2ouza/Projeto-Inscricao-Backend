import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedMembersInput = {
  accountId: string;
  localityId: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedMembersOutput = {
  members: Member[];
  total: number;
  page: number;
  pageCount: number;
};

export type Member = {
  id: string;
  name: string;
  cpf?: string;
  gender: genderType;
  locality?: string;
};

@Injectable()
export class FindAllPaginatedMembersUsecase
  implements
    Usecase<FindAllPaginatedMembersInput, FindAllPaginatedMembersOutput>
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly localityGateway: LocalityGateway,
  ) {}

  async execute(
    input: FindAllPaginatedMembersInput,
  ): Promise<FindAllPaginatedMembersOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 20)),
    );

    const localities = await this.localityGateway.findByAccountIdAndLocalities(
      input.accountId,
      input.localityId,
    );

    const localityIds = localities.map((l) => l.getId());

    const [members, total] = await Promise.all([
      this.accountParticipantGateway.findAllPaginated(safePage, safePageSize, {
        localityIds,
      }),
      this.accountParticipantGateway.countAllFiltered({
        localityIds,
      }),
    ]);

    const memberOutput = await Promise.all(
      members.map(async (m) => {
        const locality = await this.localityGateway.findById(m.getLocalityId());

        return {
          id: m.getId(),
          name: m.getName(),
          cpf: m.getCpf(),
          gender: m.getGender(),
          locality: locality?.getName(),
        };
      }),
    );

    const output: FindAllPaginatedMembersOutput = {
      members: memberOutput,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }
}
