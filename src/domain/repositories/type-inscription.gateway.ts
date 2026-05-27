import { TypeInscription } from '../entities/type-Inscription.entity';

export abstract class TypeInscriptionGateway {
  abstract create(typeInscription: TypeInscription): Promise<TypeInscription>;
  abstract update(typeInscription: TypeInscription): Promise<TypeInscription>;
  abstract delete(id: string): Promise<void>;

  abstract findById(id: string): Promise<TypeInscription | null>;
  abstract findByIds(ids: string[]): Promise<TypeInscription[]>;
  abstract findByDescription(
    eventId: string,
    description: string,
  ): Promise<TypeInscription | null>;
  abstract findAll(): Promise<TypeInscription[]>;
  abstract findByEventId(
    eventId: string,
    filters?: { active?: boolean },
  ): Promise<TypeInscription[]>;
  abstract findSpecialTypes(eventId: string): Promise<TypeInscription[]>;
  abstract findAllDescription(): Promise<TypeInscription[]>;

  // Método para encontrar os tipos de inscrição com a contagem atual de inscrições associadas a eles
  abstract findByIdsAndEventId(
    ids: string[],
    eventId: string,
  ): Promise<(TypeInscription & { currentCount: number })[]>;

  abstract findByExclusiveLinkIdWithCount(
    exclusiveLinkId: string,
    eventId: string,
  ): Promise<(TypeInscription & { currentCount: number })[]>;

  abstract findByExclusiveLinkIdsWithCount(
    linkIds: string[],
    eventId: string,
  ): Promise<Record<string, (TypeInscription & { currentCount: number })[]>>;

  abstract findByExclusiveInscriptionLinkId(
    exclusiveInscriptionLinkId: string,
  ): Promise<TypeInscription[]>;

  abstract findTypeInscriptionByAccountParticipantInEventId(
    accountParticipantInEventId: string,
  ): Promise<TypeInscription | null>;

  // busca todas os typeInscriptions que estão sendo usados pelos participantes de um evento
  abstract findTypesInUseByEventId(eventId: string): Promise<TypeInscription[]>;

  abstract countAllByEvent(eventId: string): Promise<number>;
  abstract countParticipantsUsingTypeInscription(
    typeInscriptionId: string,
  ): Promise<number>;
}
