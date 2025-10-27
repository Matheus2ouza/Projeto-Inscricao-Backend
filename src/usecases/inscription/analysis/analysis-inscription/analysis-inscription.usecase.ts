import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { inscriptionNotFoundUsecaseException } from 'src/usecases/exceptions/inscription/find/inscription-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type AnalysisInscriptionInput = {
  inscriptionId: string;
  page: number;
  pageSize: number;
};

export type AnalysisInscriptionOutput = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  status: string;
  participants: {
    id: string;
    name: string;
    birthDate: Date;
    gender: string;
  }[];
  total: number;
  page: number;
  pageCount: number;
};

@Injectable()
export class AnalysisInscriptionUsecase
  implements Usecase<AnalysisInscriptionInput, AnalysisInscriptionOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  async execute(
    input: AnalysisInscriptionInput,
  ): Promise<AnalysisInscriptionOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );

    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new inscriptionNotFoundUsecaseException(
        `attempt to search for registration data for analysis but the registration was not found, id: ${input.inscriptionId}`,
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

    // Calcula total de páginas
    const pageCount = Math.ceil(total / safePageSize);

    const participantsList = participants.map((participant) => ({
      id: participant.getId(),
      name: participant.getName(),
      birthDate: participant.getBirthDate(),
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
