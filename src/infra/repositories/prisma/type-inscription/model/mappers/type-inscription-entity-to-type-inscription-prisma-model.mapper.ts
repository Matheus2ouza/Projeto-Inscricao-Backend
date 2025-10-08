import { TypesInscription } from 'src/domain/entities/typesInscription.entity';

export class TypeInscriptionEntityToTypeInscriptionPrismaModelMapper {
  public static map(typeInscription: TypesInscription) {
    return {
      id: typeInscription.getId(),
      description: typeInscription.getDescription(),
      value: typeInscription.getValue(),
      eventId: typeInscription.getEventId(),
      createdAt: typeInscription.getCreatedAt(),
      updatedAt: typeInscription.getUpdatedAt(),
    };
  }
}
