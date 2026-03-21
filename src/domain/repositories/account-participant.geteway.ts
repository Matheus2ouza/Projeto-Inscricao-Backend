import { genderType } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant.entity';

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
  abstract findAllByAccountId(accountId: string): Promise<AccountParticipant[]>;
  abstract findByInscriptionsIds(
    inscriptionIds: string[],
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
  ): Promise<AccountParticipant[]>;

  // Agregações e contagens
  abstract countAllByEventId(eventId: string): Promise<number>;
  abstract countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;
  abstract countAllFiltered(filter: { accountId?: string }): Promise<number>;
}
