import { TypeInscription } from '../entities/type-Inscription.entity';

export abstract class TypeInscriptionGateway {
  abstract create(typeInscription: TypeInscription): Promise<TypeInscription>;
  abstract update(typeInscription: TypeInscription): Promise<TypeInscription>;

  abstract findById(id: string): Promise<TypeInscription | null>;
  abstract findByIds(ids: string[]): Promise<TypeInscription[]>;
  abstract findByDescription(
    eventId: string,
    description: string,
  ): Promise<TypeInscription | null>;
  abstract findAll(): Promise<TypeInscription[]>;
  abstract findByEventId(eventId: string): Promise<TypeInscription[]>;
  abstract findSpecialTypes(eventId: string): Promise<TypeInscription[]>;
  abstract findAllDescription(): Promise<TypeInscription[]>;

  abstract countAllByEvent(eventId: string): Promise<number>;
}
