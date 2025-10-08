import { Participant } from '../entities/participant.entity';

export abstract class ParticipantGateway {
  abstract findById(id: string): Promise<Participant | null>;
  abstract findByInscriptionId(inscriptionId: string): Promise<Participant[]>;
  abstract findByName(name: string): Promise<Participant[]>;
  abstract create(participant: Participant): Promise<void>;
  abstract update(participant: Participant): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<Participant[]>;
  abstract countAll(): Promise<number>;
  abstract countByInscriptionId(inscriptionId: string): Promise<number>;
}
