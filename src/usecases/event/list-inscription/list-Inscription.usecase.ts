import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { inscriptionNotFoundUsecaseException } from 'src/usecases/exceptions/inscription/find/inscription-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type ListInscriptionInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListInscriptionOutput = {
  id: string;
  name: string;
  quantityParticipants: number;
  inscriptions: {
    id: string;
    responsible: string;
    phone: string;
    status: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class ListInscriptionUsecase
  implements Usecase<ListInscriptionInput, ListInscriptionOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(input: ListInscriptionInput): Promise<ListInscriptionOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );

    // Busca o evento
    const event = await this.eventGateway.findById(input.eventId);
    if (!event) {
      throw new inscriptionNotFoundUsecaseException(
        `attempt to search for registrations for an event but the ID does not refer to any event, id: ${input.eventId}`,
        `Evento não encontrado`,
        ListInscriptionUsecase.name,
      );
    }

    // Busca inscrições e total
    const [allInscription, total] = await Promise.all([
      this.inscriptionGateway.findManyPaginatedByEvent(
        event.getId(),
        safePage,
        safePageSize,
      ),
      this.inscriptionGateway.countAllByEvent(event.getId()),
    ]);

    // Calcula total de páginas
    const pageCount = Math.ceil(total / safePageSize);

    // Mapeia as inscrições
    const inscriptionList = allInscription.map((inscription) => ({
      id: inscription.getId(),
      responsible: inscription.getResponsible(),
      phone: inscription.getPhone(),
      status: inscription.getStatus(),
    }));

    // Retorno final
    const output: ListInscriptionOutput = {
      id: event.getId(),
      name: event.getName(),
      quantityParticipants: event.getQuantityParticipants(),
      inscriptions: inscriptionList,
      total,
      page: safePage,
      pageCount,
    };

    return output;
  }
}
