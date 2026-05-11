import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import ExclusiveInscriptionLinkPrismaModel from '../exclusive-inscription-link.prisma.model';

export class ExclusiveInscriptionLinkEntityToExclusiveInscriptionLinkPrismaModelMapper {
  public static map(
    exclusiveInscriptionLink: ExclusiveInscriptionLink,
  ): ExclusiveInscriptionLinkPrismaModel {
    return {
      id: exclusiveInscriptionLink.getId(),
      eventId: exclusiveInscriptionLink.getEventId(),
      name: exclusiveInscriptionLink.getName(),
      token: exclusiveInscriptionLink.getToken(),
      expiresAt: exclusiveInscriptionLink.getExpiresAt(),
      active: exclusiveInscriptionLink.getActive(),
      createdBy: exclusiveInscriptionLink.getCreatedBy(),
      createdAt: exclusiveInscriptionLink.getCreatedAt(),
      updatedAt: exclusiveInscriptionLink.getUpdatedAt(),
    };
  }
}
