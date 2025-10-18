import { Injectable } from '@nestjs/common';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedOnSiteRegistrationInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedOnSiteRegistrationOutput = {
  registrations: {
    id: string;
    responsible: string;
    phone?: string;
    totalValue: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class FindAllPaginatedOnSiteRegistrationUsecase
  implements
    Usecase<
      FindAllPaginatedOnSiteRegistrationInput,
      FindAllPaginatedOnSiteRegistrationOutput
    >
{
  public constructor(
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
  ) {}

  async execute(
    input: FindAllPaginatedOnSiteRegistrationInput,
  ): Promise<FindAllPaginatedOnSiteRegistrationOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(50, Math.floor(input.pageSize || 10)),
    );
    const id = input.eventId;

    const [rows, total] = await Promise.all([
      this.onSiteRegistrationGateway.findManyPaginated(
        safePage,
        safePageSize,
        id,
      ),
      this.onSiteRegistrationGateway.countAll(id),
    ]);

    return {
      registrations: rows.map((r: OnSiteRegistration) => ({
        id: r.getId(),
        responsible: r.getResponsible(),
        phone: r.getPhone(),
        totalValue: Number(r.getTotalValue()),
        status: String(r.getStatus()),
        createdAt: r.getCreatedAt().toISOString(),
        updatedAt: r.getUpdatedAt().toISOString(),
      })),
      total,
      page: safePage,
      pageCount: Math.max(1, Math.ceil(total / safePageSize)),
    };
  }
}
