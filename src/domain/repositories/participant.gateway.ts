import { Participant } from '../entities/participant.entity';

export abstract class ParticipantGateway {
  abstract findById(id: string): Promise<Participant | null>;
  abstract findByInscriptionId(inscriptionId: string): Promise<Participant[]>;
  abstract findByName(name: string): Promise<Participant[]>;
  abstract create(participant: Participant): Promise<Participant>;
  abstract update(participant: Participant): Promise<Participant>;
  abstract delete(id: string): Promise<void>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<Participant[]>;
  abstract countAll(): Promise<number>;
  abstract countByInscriptionId(inscriptionId: string): Promise<number>;
  abstract countAllByEventId(eventId: string): Promise<number>;
  abstract findManyPaginatedByInscriptionId(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Participant[]>;
  abstract countAllByInscriptionId(inscriptionId: string): Promise<number>;
  // Buscar participantes de múltiplas inscrições
  abstract findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<Participant[]>;
  // Buscar participantes de uma conta em um evento (limitado)
  abstract findByAccountIdAndEventId(
    accountId: string,
    eventId: string,
    limit: number,
  ): Promise<Participant[]>;
  // Contar participantes de uma conta em um evento
  abstract countByAccountIdAndEventId(
    accountId: string,
    eventId: string,
  ): Promise<number>;
}
