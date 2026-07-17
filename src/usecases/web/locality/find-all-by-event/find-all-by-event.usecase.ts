import { Injectable } from '@nestjs/common';
import { UF } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type FindAllByEventInput = {
  eventId: string;
};

export type FindAllByEventOutput = {
  id: string;
  name: string;
  uf: UF;
}[];

@Injectable()
export class FindAllByEventUsecase
  implements Usecase<FindAllByEventInput, FindAllByEventOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly localityGateway: LocalityGateway,
  ) {}

  public async execute(
    input: FindAllByEventInput,
  ): Promise<FindAllByEventOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Tentativa de buscar as localidades atraves do evento mas o id: ${input.eventId} é invalido`,
        `Nenhuma localidade encontrada`,
        FindAllByEventUsecase.name,
      );
    }

    const localities = await this.localityGateway.findByEventId(event.getId());

    const output: FindAllByEventOutput = localities.map((l) => {
      return {
        id: l.getId(),
        name: l.getName(),
        uf: l.getUf(),
      };
    });

    return output;
  }
}
