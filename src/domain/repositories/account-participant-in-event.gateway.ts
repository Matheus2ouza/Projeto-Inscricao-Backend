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

  // Agregações e contagens
  abstract countByInscriptionId(inscriptionId: string): Promise<number>;
}
