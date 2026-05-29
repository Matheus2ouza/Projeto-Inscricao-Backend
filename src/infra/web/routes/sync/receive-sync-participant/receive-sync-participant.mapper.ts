import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { Participant } from 'src/domain/entities/participant.entity';

export type SyncParticipantRecord = {
  id: string;
  inscriptionId: string;
  typeInscriptionId: string;
  name: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate: Date;
  cpf?: string;
  gender: genderType;
  createdAt: Date;
  updatedAt: Date;
};

export class ReceiveSyncParticipantMapper {
  public static toEntity(record: SyncParticipantRecord): Participant {
    return Participant.with({
      id: record.id,
      inscriptionId: record.inscriptionId,
      typeInscriptionId: record.typeInscriptionId,
      name: record.name,
      birthDate: record.birthDate,
      cpf: record.cpf || undefined,
      preferredName: record.preferredName || undefined,
      shirtSize: record.shirtSize || undefined,
      shirtType: record.shirtType || undefined,
      gender: record.gender,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
