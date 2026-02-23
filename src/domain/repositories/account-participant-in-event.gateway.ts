import { genderType } from 'generated/prisma';
import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';

export abstract class AccountParticipantInEventGateway {
  //CRUD básico
  abstract create(
    accountParticipant: AccountParticipantInEvent,
  ): Promise<AccountParticipantInEvent>;
  abstract createMany(
    accountParticipants: AccountParticipantInEvent[],
  ): Promise<void>;

  // Buscas e listagens
  // Busca por accountParticipantId e eventId e retorna um AccountParticipantInEvent
  abstract findByParticipantAndEvent(
    accountParticipantId: string,
    eventId: string,
  ): Promise<AccountParticipantInEvent | null>;

  // Busca por inscriptionId e retorna uma lista de AccountParticipantInEvent
  abstract findByInscriptionId(
    inscriptionId: string,
  ): Promise<AccountParticipantInEvent[]>;

  // Busca por inscriptionIds e retorna uma lista de AccountParticipantInEvent
  abstract findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<AccountParticipantInEvent[]>;

  // Busca por eventId e accountIds e retorna uma lista de AccountParticipantInEvent
  abstract findByEventIdAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<
    {
      accountId: string | null;
      participantId: string;
      participantName: string;
      participantBirthDate: Date;
      participantGender: genderType;
      typeInscriptionId: string;
      typeInscriptionDescription?: string;
    }[]
  >;

  // Detalhes agregados de participantes por inscrição
  abstract findParticipantDetailsByInscriptionId(
    inscriptionId: string,
  ): Promise<AccountParticipantInEvent[]>;

  // Busca por inscriptionId e retorna uma lista de AccountParticipantInEvent paginada
  abstract findParticipantDetailsByInscriptionIdPaginated(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<
    {
      participantId: string;
      name: string;
      birthDate: Date;
      gender: genderType;
      typeInscriptionDescription?: string;
    }[]
  >;

  // Agregações e contagens
  // Conta o número de participantes por inscrição
  abstract countByInscriptionId(inscriptionId: string): Promise<number>;
  // Conta o número de participantes por inscrição
  abstract countParticipantByInscriptionId(
    inscriptionId: string,
  ): Promise<number>;
  // Conta o número de participantes por evento
  abstract countParticipantsByEventId(
    eventId: string,
    userId?: string,
  ): Promise<number>;
  // Conta o número de participantes por evento e gênero
  abstract countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;
}
