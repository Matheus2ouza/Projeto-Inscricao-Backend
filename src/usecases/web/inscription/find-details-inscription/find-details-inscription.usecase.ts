import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type FindDetailsInscriptionInput = {
  id: string;
};

export type FindDetailsInscriptionOutput = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  totalValue: number;
  status: string;
  createdAt: Date;
  payments?: {
    id: string;
    status: string;
    value: number;
    image: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  participants: {
    id: string;
    typeInscription: string | undefined;
    name: string;
    birthDate: Date;
    gender: string;
  }[];
  countParticipants: number;
};

@Injectable()
export class FindDetailsInscriptionUsecase
  implements Usecase<FindDetailsInscriptionInput, FindDetailsInscriptionOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindDetailsInscriptionInput,
  ): Promise<FindDetailsInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(input.id);

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `User not found with finding user with id ${input.id} in ${FindDetailsInscriptionUsecase.name}`,
        `Inscrição não encontrada`,
        FindDetailsInscriptionUsecase.name,
      );
    }

    const [payments, participants, countAll] = await Promise.all([
      this.paymentInscriptionGateway.findbyInscriptionId(input.id),
      this.participantGateway.findByInscriptionId(input.id),
      this.participantGateway.countByInscriptionId(input.id),
    ]);

    // Processar os pagamentos para obter as URLs públicas
    const enrichedPayments = await Promise.all(
      payments.map(async (p) => {
        let publicImageUrl = '';
        const imagePath = p.getImageUrl();

        if (imagePath) {
          try {
            publicImageUrl =
              await this.supabaseStorageService.getPublicUrl(imagePath);
          } catch (e) {
            // Se houver erro, mantém a URL original
            publicImageUrl = imagePath;
          }
        }

        return {
          id: p.getId(),
          status: p.getStatus(),
          value: p.getValue().toNumber(),
          image: publicImageUrl, // URL pública
          rejectionReason: p.getRejectionReason() || null,
          createdAt: p.getCreatedAt().toISOString(),
          updatedAt: p.getUpdatedAt().toISOString(),
        };
      }) || [],
    );

    const output: FindDetailsInscriptionOutput = {
      id: inscription.getId(),
      responsible: inscription.getResponsible(),
      email: inscription.getEmail(),
      phone: inscription.getPhone(),
      totalValue: inscription.getTotalValue(),
      status: inscription.getStatus(),
      createdAt: inscription.getCreatedAt(),
      payments: enrichedPayments,
      participants: participants?.map((p) => ({
        id: p.getId(),
        typeInscription: p.getTypeInscriptionDescription(),
        name: p.getName(),
        birthDate: p.getBirthDate(),
        gender: p.getGender(),
      })),
      countParticipants: countAll,
    };

    return output;
  }
}
