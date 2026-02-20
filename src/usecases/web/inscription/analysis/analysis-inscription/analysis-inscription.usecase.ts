import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type AnalysisInscriptionInput = {
  id: string;
  page: number;
  pageSize: number;
};

export type AnalysisInscriptionOutput = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  status: string;
  participants: Participants;
  total: number;
  page: number;
  pageCount: number;
};

export type Participants = {
  id: string;
  name: string;
  birthDate: Date;
  typeInscription?: string;
  gender: string;
}[];

@Injectable()
export class AnalysisInscriptionUsecase
  implements Usecase<AnalysisInscriptionInput, AnalysisInscriptionOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
  ) {}

  async execute(
    input: AnalysisInscriptionInput,
  ): Promise<AnalysisInscriptionOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );

    const inscription = await this.inscriptionGateway.findById(input.id);

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to search for registration data for analysis but the registration was not found, id: ${input.id}`,
        `Inscrição não encontrada`,
        AnalysisInscriptionUsecase.name,
      );
    }

    const [participants, total] = await Promise.all([
      this.participantGateway.findManyPaginatedByInscriptionId(
        inscription.getId(),
        safePage,
        safePageSize,
      ),
      this.participantGateway.countAllByInscriptionId(inscription.getId()),
    ]);

    const types = await this.typeInscriptionGateway.findByEventId(
      inscription.getEventId(),
    );

    const typesMap = new Map(types.map((t) => [t.getId(), t.getDescription()]));

    // Calcula total de páginas
    const pageCount = Math.ceil(total / safePageSize);

    const participantsList = participants.map((participant) => ({
      id: participant.getId(),
      name: participant.getName(),
      birthDate: participant.getBirthDate(),
      typeInscription: typesMap.get(participant.getTypeInscriptionId()),
      gender: participant.getGender(),
    }));

    const output: AnalysisInscriptionOutput = {
      id: inscription.getId(),
      responsible: inscription.getResponsible(),
      email: inscription.getEmail(),
      phone: inscription.getPhone(),
      status: inscription.getStatus(),
      participants: participantsList,
      total,
      page: safePage,
      pageCount,
    };

    return output;
  }
}
