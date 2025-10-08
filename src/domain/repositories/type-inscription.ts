import { TypesInscription } from '../entities/typesInscription.entity';

export abstract class TypeInscriptionGateway {
  abstract create(typeInscription: TypesInscription): Promise<TypesInscription>;
  abstract findById(id: string): Promise<TypesInscription | null>;
  abstract findByDescription(
    description: string,
  ): Promise<TypesInscription | null>;
  abstract findAll(): Promise<TypesInscription[]>;
  abstract findByEventId(eventId: string): Promise<TypesInscription[]>;
}
