import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';

export type ListParticipantsInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListParticipantsOutput = {
  participants: Participant[];
  countParticipants: number;
  countParticipantsMale: number;
  countParticipantsFemale: number;
  total: number;
  page: number;
  pageCount: number;
};

export type Participant = {
  id: string;
  name: string;
  preferredName: string;
  birthDate: Date;
  typeInscription: string;
  gender: string;
  shirtSize: string;
  shirtType: string;
  guest: boolean;
};

@Injectable()
export class ListParticipantsUsecase
  implements Usecase<ListParticipantsInput, ListParticipantsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(input: ListParticipantsInput): Promise<ListParticipantsOutput> {
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
        ListParticipantsUsecase.name,
      );
    }

    // Busca participantes (guests e accounts)
    const [allGuestParticipants, allAccountParticipants] = await Promise.all([
      this.participantGateway.findManyByEventId(
        event.getId(),
        1,
        Number.MAX_SAFE_INTEGER,
      ),
      this.accountParticipantGateway.findManyByEventId(
        event.getId(),
        1,
        Number.MAX_SAFE_INTEGER,
      ),
    ]);

    // Busca contagens por gênero
    const [
      countGuestMale,
      countGuestFemale,
      countAccountMale,
      countAccountFemale,
    ] = await Promise.all([
      this.participantGateway.countParticipantsByEventIdAndGender(
        event.getId(),
        genderType.MASCULINO,
      ),
      this.participantGateway.countParticipantsByEventIdAndGender(
        event.getId(),
        genderType.FEMININO,
      ),
      this.accountParticipantGateway.countParticipantsByEventIdAndGender(
        event.getId(),
        genderType.MASCULINO,
      ),
      this.accountParticipantGateway.countParticipantsByEventIdAndGender(
        event.getId(),
        genderType.FEMININO,
      ),
    ]);

    // Mapeia guests
    const mappedGuests = await Promise.all(
      allGuestParticipants.map(async (g) => {
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
          guest: true,
        };
      }),
    );

    // Mapeia account participants
    const mappedAccountParticipants = await Promise.all(
      allAccountParticipants.map(async (a) => {
        const typeInscription =
          await this.typeInscriptionGateway.findTypeInscriptionByAccountParticipantInEventId(
            a.getId(),
          );

        return {
          id: a.getId(),
          name: a.getName(),
          birthDate: a.getBirthDate(),
          typeInscription: typeInscription?.getDescription() || '',
          gender:
            a.getGender() === genderType.MASCULINO ? 'Masculino' : 'Feminino',
          preferredName: a.getPreferredName() || 'Não Informado',
          shirtSize: a.getShirtSize() || 'Não Informado',
          shirtType: a.getShirtType() || 'Não Informado',
          guest: false,
        };
      }),
    );

    // Une e ordena alfabeticamente por nome
    const allParticipants = [
      ...mappedGuests,
      ...mappedAccountParticipants,
    ].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    const total = allParticipants.length;

    // Aplica paginação sobre a lista combinada
    const offset = (safePage - 1) * safePageSize;
    const paginated = allParticipants.slice(offset, offset + safePageSize);

    return {
      participants: paginated,
      countParticipants: total,
      countParticipantsMale: countGuestMale + countAccountMale,
      countParticipantsFemale: countGuestFemale + countAccountFemale,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }
}
