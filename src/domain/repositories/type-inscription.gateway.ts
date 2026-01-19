import { TypesInscription } from '../entities/typesInscription.entity';

export abstract class TypeInscriptionGateway {
  abstract create(typeInscription: TypesInscription): Promise<TypesInscription>;
  abstract update(typeInscription: TypesInscription): Promise<TypesInscription>;

  abstract findById(id: string): Promise<TypesInscription | null>;
  abstract findByIds(ids: string[]): Promise<TypesInscription[]>;
  abstract findByDescription(
    eventId: string,
    description: string,
  ): Promise<TypesInscription | null>;
  abstract findAll(): Promise<TypesInscription[]>;
  abstract findByEventId(eventId: string): Promise<TypesInscription[]>;
  abstract findSpecialTypes(eventId: string): Promise<TypesInscription[]>;
  abstract findAllDescription(): Promise<TypesInscription[]>;

  abstract countAllByEvent(eventId: string): Promise<number>;
}
