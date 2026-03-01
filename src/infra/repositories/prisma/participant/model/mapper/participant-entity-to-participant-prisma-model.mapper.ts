import { Participant } from 'src/domain/entities/participant.entity';
import ParticipantPrismaModel from '../participant.prisma.model';

export class ParticipantEntityToParticipantPrismaModelMapper {
  public static map(participant: Participant): ParticipantPrismaModel {
    return {
      id: participant.getId(),
      inscriptionId: participant.getInscriptionId(),
      typeInscriptionId: participant.getTypeInscriptionId(),
      name: participant.getName(),
      preferredName: participant.getPreferredName() ?? null,
      shirtSize: participant.getShirtSize() ?? null,
      shirtType: participant.getShirtType() ?? null,
      birthDate: participant.getBirthDate(),
      cpf: participant.getCpf() ?? null,
      gender: participant.getGender(),
      createdAt: participant.getCreatedAt(),
      updatedAt: participant.getUpdatedAt(),
    };
  }
}
