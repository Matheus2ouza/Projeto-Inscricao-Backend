import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedMembersInput = {
  accountId: string;
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
  birthDate: string;
  gender: genderType;
  createdAt: string;
};

@Injectable()
export class FindAllPaginatedMembersUsecase
  implements
    Usecase<FindAllPaginatedMembersInput, FindAllPaginatedMembersOutput>
{
  constructor(
    private readonly accountParticipantGateway: AccountParticipantGateway,
  ) {}

  async execute(
    input: FindAllPaginatedMembersInput,
  ): Promise<FindAllPaginatedMembersOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 20)),
    );

    const [members, total] = await Promise.all([
      this.accountParticipantGateway.findAllPaginated(safePage, safePageSize, {
        accountId: input.accountId,
      }),
      this.accountParticipantGateway.countAllFiltered({
        accountId: input.accountId,
      }),
    ]);

    const memberOutput: Member[] = members.map((member) => ({
      id: member.getId(),
      name: member.getName(),
      birthDate: member.getBirthDate().toISOString(),
      gender: member.getGender(),
      createdAt: member.getCreatedAt().toISOString(),
    }));

    const output: FindAllPaginatedMembersOutput = {
      members: memberOutput,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }
}
