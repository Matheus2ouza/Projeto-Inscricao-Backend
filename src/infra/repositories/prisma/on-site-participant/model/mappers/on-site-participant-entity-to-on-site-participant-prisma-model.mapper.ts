import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import OnSiteParticipantPrismaModel from '../on-site-participant.prisma.model';

export class OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper {
  public static map(
    onSiteParticipant: OnSiteParticipant,
  ): OnSiteParticipantPrismaModel {
    const aModel: OnSiteParticipantPrismaModel = {
      id: onSiteParticipant.getId(),
      onSiteRegistrationId: onSiteParticipant.getOnSiteRegistrationId(),
      name: onSiteParticipant.getName(),
      gender: onSiteParticipant.getGender(),
      createdAt: onSiteParticipant.getCreatedAt(),
      updatedAt: onSiteParticipant.getUpdatedAt(),
    };

    return aModel;
  }
}
