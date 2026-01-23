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
  abstract findByParticipantAndEvent(
    accountParticipantId: string,
    eventId: string,
  ): Promise<AccountParticipantInEvent | null>;
  abstract findByInscriptionId(
    inscriptionId: string,
  ): Promise<AccountParticipantInEvent[]>;
  abstract findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<AccountParticipantInEvent[]>;
  abstract findByEventIdAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<
    {
      accountId: string;
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
  ): Promise<
    {
      participantId: string;
      name: string;
      birthDate: Date;
      gender: genderType;
      typeInscriptionDescription?: string;
    }[]
  >;
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
  abstract countByInscriptionId(inscriptionId: string): Promise<number>;
  abstract countParticipantByInscriptionId(
    inscriptionId: string,
  ): Promise<number>;
  abstract countParticipantsByEventId(eventId: string): Promise<number>;
  abstract countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;
}
