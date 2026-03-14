import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';

export class TypeInscriptionEntityToTypeInscriptionPrismaModelMapper {
  public static map(typeInscription: TypeInscription) {
    return {
      id: typeInscription.getId(),
      description: typeInscription.getDescription(),
      value: typeInscription.getValue(),
      eventId: typeInscription.getEventId(),
      rule: typeInscription.getRule(),
      specialType: typeInscription.getSpecialType(),
      active: typeInscription.getActive(),
      createdAt: typeInscription.getCreatedAt(),
      updatedAt: typeInscription.getUpdatedAt(),
    };
  }
}
