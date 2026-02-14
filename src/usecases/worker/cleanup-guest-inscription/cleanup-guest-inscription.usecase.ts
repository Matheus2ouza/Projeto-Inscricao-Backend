import { Injectable, Logger } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';

export type CleanupGuestInscriptionInput = void;

export type CleanupGuestInscriptionOutput = {
  cleanedCount: number;
  inscriptionsDeleted: Inscription[];
};

type Inscription = {
  id: string;
  guestName?: string;
};

@Injectable()
export class CleanupGuestInscriptionUsecase
  implements
    Usecase<CleanupGuestInscriptionInput, CleanupGuestInscriptionOutput>
{
  private readonly logger = new Logger(CleanupGuestInscriptionUsecase.name);

  constructor(private readonly inscriptionGateway: InscriptionGateway) {}

  async execute(input: void): Promise<CleanupGuestInscriptionOutput> {
    this.logger.log('Iniciando limpeza de inscrições guest expiradas');
    // Busca as inscrições que foram marcadas como expiradas posteriomente
    const inscriptions =
      await this.inscriptionGateway.findManyGuestInscriptionMarkedExpired();
    this.logger.log(
      `Inscrições guest expiradas encontradas: ${inscriptions.length}`,
    );

    // Deleta as inscrições usando o método deleteMany do gateway
    const cleanedCount = await this.inscriptionGateway.deleteMany(
      inscriptions.map((inscription) => inscription.getId()),
    );
    this.logger.log(`Inscrições guest expiradas removidas: ${cleanedCount}`);

    // Mapeia as inscrições deletadas para o formato de saída
    const inscriptionsDeleted: Inscription[] = inscriptions.map((i) => ({
      id: i.getId(),
      guestName: i.getGuestName(),
    }));

    const output: CleanupGuestInscriptionOutput = {
      cleanedCount,
      inscriptionsDeleted,
    };

    return output;
  }
}
