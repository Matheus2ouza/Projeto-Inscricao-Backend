import { TypesInscription } from 'src/domain/entities/typesInscription.entity';
import TypeInscriptionsModel from '../type-inscription.model';

export class TypeInscriptionPrismaModelToTypeInscriptionEntityMapper {
  public static map(typeInscription: TypeInscriptionsModel): TypesInscription {
    return TypesInscription.with({
      id: typeInscription.id,
      description: typeInscription.description,
      value: Number(typeInscription.value),
      eventId: typeInscription.eventId,
      specialtype: typeInscription.specialType,
      createdAt: typeInscription.createdAt,
      updatedAt: typeInscription.updatedAt,
    });
  }
}
