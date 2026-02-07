import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListGuestParticipantsInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListGuestParticipantsOutput = {
  guestParticipants: GuestParticipant[];
  countGuestParticipants: number;
  countGuestParticipantsMale: number;
  countGuestParticipantsFemale: number;
  total: number;
  page: number;
  pageCount: number;
};

export type GuestParticipant = {
  id: string;
  name: string;
  preferredName: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
  shirtSize: string;
  shirtType: string;
};

@Injectable()
export class ListGuestParticipantsUsecase
  implements Usecase<ListGuestParticipantsInput, ListGuestParticipantsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: ListGuestParticipantsInput,
  ): Promise<ListGuestParticipantsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 20)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId}`,
        `Evento não encontrado`,
        ListGuestParticipantsUsecase.name,
      );
    }

    // Busca os participantes guest do evento
    // os count não levam em consideração o SafePageSize
    const [
      guestsParticipants,
      countGuestParticipantsTotal,
      countGuestParticipantsMale,
      countGuestParticipantsFemale,
    ] = await Promise.all([
      this.participantGateway.findManyByEventId(
        event.getId(),
        safePage,
        safePageSize,
      ),
      this.participantGateway.countAllByEventId(event.getId()),
      this.participantGateway.countParticipantsByEventIdAndGender(
        event.getId(),
        genderType.MASCULINO,
      ),
      this.participantGateway.countParticipantsByEventIdAndGender(
        event.getId(),
        genderType.FEMININO,
      ),
    ]);

    const guestParticipants = await Promise.all(
      guestsParticipants.map(async (g) => {
        const typeInscription = await this.typeInscriptionGateway.findById(
          g.getTypeInscriptionId(),
        );

        return {
          id: g.getId(),
          name: g.getName(),
          birthDate: g.getBirthDate(),
          typeInscription: typeInscription?.getDescription() || '',
          gender:
            g.getGender() === genderType.MASCULINO ? 'Masculino' : 'Feminino',
          preferredName: g.getPreferredName() || 'Não Informado',
          shirtSize: g.getShirtSize() || 'Não Informado',
          shirtType: g.getShirtType() || 'Não Informado',
        };
      }),
    );

    const output: ListGuestParticipantsOutput = {
      guestParticipants,
      countGuestParticipants: countGuestParticipantsTotal,
      countGuestParticipantsMale,
      countGuestParticipantsFemale,
      total: countGuestParticipantsTotal,
      page: safePage,
      pageCount: Math.ceil(countGuestParticipantsTotal / safePageSize),
    };
    return output;
  }
}
