import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import ExclusiveInscriptionLinkTypePrismaModel from '../exclusive-inscription-link-type.prisma.model';

export class ExclusiveInscriptionLinkTypeEntityToExclusiveInscriptionLinkTypePrismaModelMapper {
  public static map(
    exclusiveInscriptionLinkType: ExclusiveInscriptionLinkType,
  ): ExclusiveInscriptionLinkTypePrismaModel {
    return {
      id: exclusiveInscriptionLinkType.getId(),
      exclusiveLinkId: exclusiveInscriptionLinkType.getExclusiveLinkId(),
      typeInscriptionId: exclusiveInscriptionLinkType.getTypeInscriptionId(),
      createdAt: exclusiveInscriptionLinkType.getCreatedAt(),
    };
  }
}
