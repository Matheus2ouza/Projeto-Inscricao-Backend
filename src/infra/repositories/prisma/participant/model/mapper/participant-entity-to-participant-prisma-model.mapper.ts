import { Participant } from 'src/domain/entities/participant.entity';
import ParticipantPrismaModel from '../participant.prisma.model';

export class ParticipantEntityToParticipantPrismaModelMapper {
  public static map(participant: Participant): ParticipantPrismaModel {
    return {
      id: participant.getId(),
      inscriptionId: participant.getInscriptionId(),
      typeInscriptionId: participant.getTypeInscriptionId(),
      name: participant.getName(),
      birthDate: participant.getBirthDate(),
      gender: participant.getGender(),
      createdAt: participant.getCreatedAt(),
      updatedAt: participant.getUpdatedAt(),
    };
  }
}
