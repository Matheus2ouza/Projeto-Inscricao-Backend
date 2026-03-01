import { Participant } from 'src/domain/entities/participant.entity';
import ParticipantPrismaModel from '../participant.prisma.model';

export class ParticipantPrismaModelToParticipantEntityMapper {
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
      cpf: participantPrisma.cpf || undefined,
      preferredName: participantPrisma.preferredName || undefined,
      shirtSize: participantPrisma.shirtSize || undefined,
      shirtType: participantPrisma.shirtType || undefined,
      gender: participantPrisma.gender,
      createdAt: participantPrisma.createdAt,
      updatedAt: participantPrisma.updatedAt,
    });
  }
}
