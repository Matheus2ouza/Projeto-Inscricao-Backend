import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';

export abstract class AccountParticipantInEventGateway {
  //CRUD básico
  abstract create(
    accountParticipant: AccountParticipantInEvent,
  ): Promise<AccountParticipantInEvent>;

  // Buscas e listagens
  abstract findByParticipantAndEvent(
    accountParticipantId: string,
    eventId: string,
  ): Promise<AccountParticipantInEvent | null>;
}
