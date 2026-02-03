import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';
import TypeInscriptionsModel from '../type-inscription.model';

export class TypeInscriptionPrismaModelToTypeInscriptionEntityMapper {
  public static map(typeInscription: TypeInscriptionsModel): TypeInscription {
    return TypeInscription.with({
      id: typeInscription.id,
      description: typeInscription.description,
      value: Number(typeInscription.value),
      eventId: typeInscription.eventId,
      rule: typeInscription.rule || null,
      specialType: typeInscription.specialType,
      createdAt: typeInscription.createdAt,
      updatedAt: typeInscription.updatedAt,
    });
  }
}
