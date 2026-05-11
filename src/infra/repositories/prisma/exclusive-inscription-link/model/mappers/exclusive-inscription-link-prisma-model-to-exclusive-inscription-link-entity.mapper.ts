import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import ExclusiveInscriptionLinkPrismaModel from '../exclusive-inscription-link.prisma.model';

export class ExclusiveInscriptionLinkPrismaModelToExclusiveInscriptionLinkEntityMapper {
  public static map(
    exclusiveInscriptionLink: ExclusiveInscriptionLinkPrismaModel,
  ): ExclusiveInscriptionLink {
    return ExclusiveInscriptionLink.with({
      id: exclusiveInscriptionLink.id,
      eventId: exclusiveInscriptionLink.eventId,
      name: exclusiveInscriptionLink.name,
      token: exclusiveInscriptionLink.token,
      expiresAt: exclusiveInscriptionLink.expiresAt,
      active: exclusiveInscriptionLink.active,
      createdBy: exclusiveInscriptionLink.createdBy,
      createdAt: exclusiveInscriptionLink.createdAt,
      updatedAt: exclusiveInscriptionLink.updatedAt,
    });
  }
}
