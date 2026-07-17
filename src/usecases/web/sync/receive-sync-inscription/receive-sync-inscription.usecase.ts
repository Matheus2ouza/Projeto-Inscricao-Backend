import { Injectable, Logger } from '@nestjs/common';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncInscriptionInput = {
  inscription: Inscription;
};

export type ReceiveSyncInscriptionOutput = {
  id: string;
  operation: 'created' | 'updated';
};

@Injectable()
export class ReceiveSyncInscriptionUsecase
  implements Usecase<ReceiveSyncInscriptionInput, ReceiveSyncInscriptionOutput>
{
  private readonly logger = new Logger(ReceiveSyncInscriptionUsecase.name);
  constructor(private readonly inscriptionGateway: InscriptionGateway) {}

  async execute(
    input: ReceiveSyncInscriptionInput,
  ): Promise<ReceiveSyncInscriptionOutput> {
    const inscription = input.inscription;

    this.logger.log('Validando se a inscrição já existe no banco');
    const existingInscription = await this.inscriptionGateway.findById(
      inscription.getId(),
    );

    this.logger.log(
      `Inscrição ${inscription.getId()} ${existingInscription ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    await this.inscriptionGateway.upsert(inscription);

    this.logger.log(`Inscrição sincronizada: ${inscription.getId()}`);
    const output: ReceiveSyncInscriptionOutput = {
      id: inscription.getId(),
      operation: existingInscription ? 'updated' : 'created',
    };

    return output;
  }
}
