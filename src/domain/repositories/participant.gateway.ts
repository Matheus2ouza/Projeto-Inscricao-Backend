import { genderType } from 'generated/prisma';
import { Participant } from '../entities/participant.entity';

export abstract class ParticipantGateway {
  // CRUD básico
  abstract create(participant: Participant): Promise<Participant>;
  abstract update(participant: Participant): Promise<Participant>;
  abstract delete(id: string): Promise<void>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<Participant | null>;

  // Buscas por relacionamento
  abstract findByName(name: string): Promise<Participant[]>;
  abstract findByInscriptionId(inscriptionId: string): Promise<Participant[]>;
  abstract findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<Participant[]>;
  abstract findByAccountIdAndEventId(
    accountId: string,
    eventId: string,
    limit: number,
  ): Promise<Participant[]>;

  // Buscas paginadas
  abstract findManyByEventId(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<Participant[]>;
  abstract findManyPaginatedByInscriptionId(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Participant[]>;

  // Agregações e contagens
  abstract countAll(): Promise<number>;
  abstract countByInscriptionId(inscriptionId: string): Promise<number>;
  abstract countAllByInscriptionId(inscriptionId: string): Promise<number>;
  abstract countAllByEventId(eventId: string): Promise<number>;
  abstract countByAccountIdAndEventId(
    accountId: string,
    eventId: string,
  ): Promise<number>;
  abstract countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number>;
}
