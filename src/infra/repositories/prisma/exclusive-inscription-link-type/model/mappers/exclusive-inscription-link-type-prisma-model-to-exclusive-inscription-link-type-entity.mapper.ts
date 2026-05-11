import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import ExclusiveInscriptionLinkTypePrismaModel from '../exclusive-inscription-link-type.prisma.model';

export class ExclusiveInscriptionLinkTypePrismaModelToExclusiveInscriptionLinkTypeEntityMapper {
  public static map(
    exclusiveInscriptionLinkType: ExclusiveInscriptionLinkTypePrismaModel,
  ): ExclusiveInscriptionLinkType {
    return ExclusiveInscriptionLinkType.with({
      id: exclusiveInscriptionLinkType.id,
      exclusiveLinkId: exclusiveInscriptionLinkType.exclusiveLinkId,
      typeInscriptionId: exclusiveInscriptionLinkType.typeInscriptionId,
      createdAt: exclusiveInscriptionLinkType.createdAt,
    });
  }
}
