import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllPaginatedInscriptionsInput = {
  userId: string;
  eventId?: string;
  limitTime?: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedInscriptionsOutput = {
  inscription: {
    id: string;
    responsible: string;
    totalValue: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
  totalInscription: number;
  totalParticipant: number;
  totalDebt: number;
};

@Injectable()
export class FindAllPaginatedInscriptionsUsecase
  implements
    Usecase<
      FindAllPaginatedInscriptionsInput,
      FindAllPaginatedInscriptionsOutput
    >
{
  public constructor(private readonly inscriptionGateway: InscriptionGateway) {}

  async execute(
    input: FindAllPaginatedInscriptionsInput,
  ): Promise<FindAllPaginatedInscriptionsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );

    const filters = {
      userId: input.userId, // Sempre obrigatório
      eventId: input.eventId, // Opcional
      limitTime: input.limitTime, // Opcional
    };

    const [inscriptions, totalInscription, totalParticipant, totalDebt] =
      await Promise.all([
        this.inscriptionGateway.findManyPaginated(
          safePage,
          safePageSize,
          filters,
        ),
        this.inscriptionGateway.countAll(filters),
        this.inscriptionGateway.countParticipants(filters),
        this.inscriptionGateway.sumTotalDebt(filters),
      ]);

    const total = totalInscription; // Total de inscrições para paginação

    return {
      inscription: inscriptions.map((insc) => ({
        id: insc.getId(),
        responsible: insc.getResponsible(),
        totalValue: insc.getTotalValue(),
        status: insc.getStatus(),
        createdAt: insc.getCreatedAt().toISOString(),
        updatedAt: insc.getUpdatedAt().toISOString(),
      })),
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
      totalInscription,
      totalParticipant,
      totalDebt,
    };
  }
}
