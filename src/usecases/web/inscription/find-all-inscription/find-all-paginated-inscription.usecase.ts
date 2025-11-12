import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type FindAllPaginatedInscriptionsInput = {
  eventId: string;
  userId: string;
  limitTime?: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedInscriptionsOutput = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
  totalInscription: number;
  totalParticipant: number;
  totalDebt: number;
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
export class FindAllPaginatedInscriptionsUsecase
  implements
    Usecase<
      FindAllPaginatedInscriptionsInput,
      FindAllPaginatedInscriptionsOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindAllPaginatedInscriptionsInput,
  ): Promise<FindAllPaginatedInscriptionsOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId} in ${FindAllPaginatedInscriptionsUsecase.name}`,
        `Evento não encontrado`,
        FindAllPaginatedInscriptionsUsecase.name,
      );
    }

    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );

    const filters = {
      userId: input.userId, // Sempre obrigatório
      eventId: input.eventId, // Obrigatório - vem do parâmetro da rota
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

    // Obter URL pública da imagem do evento
    let publicImageUrl = '';
    const imagePath = event.getImageUrl();
    if (imagePath) {
      try {
        publicImageUrl =
          await this.supabaseStorageService.getPublicUrl(imagePath);
      } catch (e) {
        publicImageUrl = '';
      }
    }

    // Mapear inscrições
    const mappedInscriptions = inscriptions.map((insc) => ({
      id: insc.getId(),
      responsible: insc.getResponsible(),
      totalValue: Number(insc.getTotalValue()),
      status: insc.getStatus(),
    }));

    // Criar evento com inscrições paginadas
    const eventData = {
      id: event.getId(),
      name: event.getName(),
      image: publicImageUrl,
      startDate: event.getStartDate().toISOString(),
      endDate: event.getEndDate().toISOString(),
      totalParticipant: event.getQuantityParticipants(),
      totalDebt,
      inscriptions: mappedInscriptions,
    };

    const total = totalInscription; // Total de inscrições para paginação

    return {
      events: [eventData],
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
      totalInscription,
      totalParticipant,
      totalDebt,
    };
  }
}
