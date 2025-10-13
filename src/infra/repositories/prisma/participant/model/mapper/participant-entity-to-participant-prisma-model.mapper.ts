import { Participant } from 'src/domain/entities/participant.entity';
import ParticipantPrismaModel from '../participant.prisma.model';

export class ParticipantEntityToParticipantPrismaModelMapper {
  public static map(
    participantPrisma: ParticipantPrismaModel & {
      typeInscription?: { description?: string } | null;
    },
  ): Participant {
    return Participant.with({
      id: participantPrisma.id,
      inscriptionId: participantPrisma.inscriptionId,
      typeInscriptionId: participantPrisma.typeInscriptionId,
      name: participantPrisma.name,
      birthDate: participantPrisma.birthDate,
      gender: participantPrisma.gender,
      createdAt: participantPrisma.createdAt,
      updatedAt: participantPrisma.updatedAt,
      typeInscriptionDescription:
        participantPrisma.typeInscription?.description ?? undefined,
    });
  }
}
