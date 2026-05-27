import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
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

  // filters
  inscriptionStatus: InscriptionStatus[];
  typeInscriptions: string[];
  orderByName: 'asc' | 'desc';
};

export type ListParticipantsOutput = {
  participants: Participant[];
  countParticipants: number;
  countParticipantsMale: number;
  countParticipantsFemale: number;
  typesInscriptionsInUse: TypeInscription[];
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

type TypeInscription = {
  id: string;
  description: string;
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

    const filters = {
      inscriptionStatus: input.inscriptionStatus,
      typeInscriptionId: input.typeInscriptions,
      orderByName: input.orderByName,
    };

    // Busca participantes (guests e accounts)
    const [allGuestParticipants, allAccountParticipants] = await Promise.all([
      this.participantGateway.findManyByEventId(
        event.getId(),
        safePage,
        safePageSize,
        filters,
      ),
      this.accountParticipantGateway.findManyByEventId(
        event.getId(),
        safePage,
        safePageSize,
        filters,
      ),
    ]);

    const typeInscriptions =
      await this.typeInscriptionGateway.findTypesInUseByEventId(event.getId());

    const typeInscriptionInUse = typeInscriptions.map((t) => ({
      id: t.getId(),
      description: t.getDescription(),
    }));

    // Busca contagens por gênero
    const [guestParticipantsGenderCount, accountParticipantsGenderCount] =
      await Promise.all([
        this.participantGateway.countParticipantsByEventIdGroupedByGender(
          event.getId(),
          filters,
        ),
        this.accountParticipantGateway.countParticipantsByEventIdGroupedByGender(
          event.getId(),
          filters,
        ),
      ]);

    const countGuestMale = guestParticipantsGenderCount.male;
    const countGuestFemale = guestParticipantsGenderCount.female;
    const countAccountMale = accountParticipantsGenderCount.male;
    const countAccountFemale = accountParticipantsGenderCount.female;

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

    const totalGuests = countGuestMale + countGuestFemale;
    const totalAccounts = countAccountMale + countAccountFemale;

    const total = totalGuests + totalAccounts;

    return {
      participants: allParticipants,
      countParticipants: total,
      countParticipantsMale: countGuestMale + countAccountMale,
      countParticipantsFemale: countGuestFemale + countAccountFemale,
      typesInscriptionsInUse: typeInscriptionInUse,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
  }
}
