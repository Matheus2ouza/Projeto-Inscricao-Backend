import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import OnSiteParticipantPrismaModel from '../on-site-participant.prisma.model';

export class OnSiteParticipantPrismaModelToOnSiteParticipantEntityMapper {
  public static map(
    onSiteParticipant: OnSiteParticipantPrismaModel,
  ): OnSiteParticipant {
    const anOnSiteRegistration = OnSiteParticipant.with({
      id: onSiteParticipant.id,
      onSiteRegistrationId: onSiteParticipant.onSiteRegistrationId,
      value: onSiteParticipant.value,
      name: onSiteParticipant.name,
      birthDate: onSiteParticipant.birthDate,
      gender: onSiteParticipant.gender,
      createdAt: onSiteParticipant.createdAt,
      updatedAt: onSiteParticipant.updatedAt,
    });

    return anOnSiteRegistration;
  }
}
