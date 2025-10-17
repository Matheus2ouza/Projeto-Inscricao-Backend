import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import OnSiteParticipantPrismaModel from '../on-site-participant.prisma.model';

export class OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper {
  public static map(
    onSiteParticipant: OnSiteParticipant,
  ): OnSiteParticipantPrismaModel {
    const aModel: OnSiteParticipantPrismaModel = {
      id: onSiteParticipant.getId(),
      onSiteRegistrationId: onSiteParticipant.getOnSiteRegistrationId(),
      value: onSiteParticipant.getValue(),
      name: onSiteParticipant.getName(),
      birthDate: onSiteParticipant.getBirthDate(),
      gender: onSiteParticipant.getGender(),
      createdAt: onSiteParticipant.getCreatedAt(),
      updatedAt: onSiteParticipant.getUpdatedAt(),
    };

    return aModel;
  }
}
