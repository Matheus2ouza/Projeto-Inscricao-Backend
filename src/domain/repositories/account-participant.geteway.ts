import { genderType, InscriptionStatus } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant/account-participant.entity';

export abstract class AccountParticipantGateway {
  //CRUD básico
  abstract create(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant>;
  abstract update(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant>;

  // Buscas e listagens
  abstract findById(id: string): Promise<AccountParticipant | null>;
  abstract findByIds(ids: string[]): Promise<AccountParticipant[]>;
  abstract findAllByAccountId(
    localityId: string,
  ): Promise<AccountParticipant[]>;
  abstract findByInscriptionsIds(
    inscriptionIds: string[],
    filter: {
      typeInscriptionId?: string | string[];
      startDate?: string;
      endDate?: string;
    },
  ): Promise<AccountParticipant[]>;
  abstract findAll(filter?: {
    regionId?: string;
  }): Promise<AccountParticipant[]>;
  abstract findByInscriptionId(
    inscriptionId: string,
  ): Promise<AccountParticipant[]>;
  abstract findAllPaginated(
    page: number,
    pageSize: number,
    filter: {
      accountId?: string;
    },
  ): Promise<AccountParticipant[]>;
  abstract findManyByEventId(
    eventId: string,
    page: number,
    pageSize: number,
    filters?: {
      inscriptionStatus?: InscriptionStatus[];
      typeInscriptionId: string | string[];
      orderByName: 'asc' | 'desc';
    },
  ): Promise<AccountParticipant[]>;

  // Agregações e contagens
  abstract countAllByEventId(eventId: string): Promise<number>;
  // contagem de participantes em um evento agrupando por gênero
  abstract countParticipantsByEventIdGroupedByGender(
    eventId: string,
    filters: {
      inscriptionStatus?: InscriptionStatus[];
      typeInscriptionId: string | string[];
    },
  ): Promise<{
    male: number;
    female: number;
  }>;
  // contagem de participantes em um evento, filtrando por genero
  abstract countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;
  abstract countAllFiltered(filter: { accountId?: string }): Promise<number>;
}
