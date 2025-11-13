import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindAllWithInscriptionsInput = {
  accountId: string;
  page: number;
  pageSize: number;
};

export type FindAllWithInscriptionsOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  image: string;
  startDate: string;
  endDate: string;
  totalParticipant: number;
  totalDebt: number;
  inscriptions: Inscriptions;
}[];

export type Inscriptions = {
  id: string;
  responsible: string;
  totalValue: number;
  status: string;
}[];

@Injectable()
export class FindAllWithInscriptionsUsecase
  implements
    Usecase<FindAllWithInscriptionsInput, FindAllWithInscriptionsOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllWithInscriptionsInput,
  ): Promise<FindAllWithInscriptionsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(5, Math.floor(input.pageSize || 5)),
    );

    const allEvents = await this.eventGateway.findAll();

    // Filtrar eventos que não estão finalizados
    const activeEvents = allEvents.filter(
      (event) => event.getStatus() !== statusEvent.FINALIZED,
    );

    const total = activeEvents.length;

    const start = (safePage - 1) * safePageSize;
    const end = start + safePageSize;
    const pageEvents = activeEvents.slice(start, end);

    const events = await Promise.all(
      pageEvents.map(async (event) => {
        // Buscar todas as inscrições do evento
        const allInscriptions = await this.inscriptionGateway.findMany(
          event.getId(),
        );

        // Filtrar apenas as inscrições do accountId especificado
        const accountInscriptions = allInscriptions.filter(
          (inscription) => inscription.getAccountId() === input.accountId,
        );

        // Calcular totalDebt e totalParticipant apenas das inscrições do accountId
        const [totalDebt, totalParticipant] = await Promise.all([
          // Calcular totalDebt
          Promise.resolve(
            accountInscriptions.reduce(
              (sum, inscription) => sum + Number(inscription.getTotalValue()),
              0,
            ),
          ),
          // Contar participantes apenas das inscrições do accountId
          this.inscriptionGateway.countParticipants({
            userId: input.accountId,
            eventId: event.getId(),
          }),
        ]);

        // Ordenar por data de criação (mais recentes primeiro) e pegar as 5 primeiras
        const inscriptions = accountInscriptions
          .sort(
            (a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime(),
          )
          .slice(0, 5);

        // Obter URL pública da imagem
        let publicImageUrl = '';
        const imagePath = event.getImageUrl();
        if (imagePath) {
          try {
            publicImageUrl =
              await this.supabaseStorageService.getPublicUrl(imagePath);
          } catch {
            publicImageUrl = '';
          }
        }

        const mappedInscriptions = inscriptions.map((inscription) => ({
          id: inscription.getId(),
          responsible: inscription.getResponsible(),
          totalValue: Number(inscription.getTotalValue()),
          status: inscription.getStatus(),
        }));

        return {
          id: event.getId(),
          name: event.getName(),
          image: publicImageUrl,
          startDate: event.getStartDate().toISOString(),
          endDate: event.getEndDate().toISOString(),
          totalParticipant,
          totalDebt,
          inscriptions: mappedInscriptions,
        };
      }),
    );

    return {
      events,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }
}
