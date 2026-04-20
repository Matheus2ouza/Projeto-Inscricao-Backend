import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindAllInscriptionInput = {
  eventId: string;
  status: InscriptionStatus[];
  responsible?: string;
};

export type FindAllInscriptionOutput = {
  id: string;
  responsible: string;
  status: string;
  totalValue: number;
  totalPaid: number;
}[];

@Injectable()
export class FindAllInscriptionsUsecase
  implements Usecase<FindAllInscriptionInput, FindAllInscriptionOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(
    input: FindAllInscriptionInput,
  ): Promise<FindAllInscriptionOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId}`,
        `Evento não encontrado`,
        FindAllInscriptionsUsecase.name,
      );
    }

    const filters = {
      status: input.status,
      responsible: input.responsible,
    };

    const inscriptions = await this.inscriptionGateway.findMany(
      event.getId(),
      filters,
    );

    const output: FindAllInscriptionOutput = inscriptions.map(
      (inscription) => ({
        id: inscription.getId(),
        responsible: inscription.getResponsible(),
        status: inscription.getStatus(),
        totalValue: inscription.getTotalValue(),
        totalPaid: inscription.getTotalPaid(),
      }),
    );

    return output;
  }
}
