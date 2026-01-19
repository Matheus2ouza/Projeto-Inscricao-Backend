import { AccountParticipant } from 'src/domain/entities/account-participant.entity';

export abstract class AccountParticipantGateway {
  //CRUD básico
  abstract create(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant>;

  // Buscas e listagens
  abstract findById(id: string): Promise<AccountParticipant | null>;
  abstract findByIds(ids: string[]): Promise<AccountParticipant[]>;
  abstract findAllByAccountId(
    accountId: string,
    eventId: string,
  ): Promise<AccountParticipant[]>;
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

  // Agregações e contagens
  abstract countAllFiltered(filter: { accountId?: string }): Promise<number>;
}
