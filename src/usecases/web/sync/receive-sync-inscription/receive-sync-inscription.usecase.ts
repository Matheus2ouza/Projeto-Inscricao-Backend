import { Injectable, Logger } from '@nestjs/common';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { SyncRecordAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/sync/sync-record-already-exists.usecase.exception';

export type ReceiveSyncInscriptionInput = {
  inscription: Inscription;
};

export type ReceiveSyncInscriptionOutput = {
  id: string;
  operation: 'created';
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

    this.logger.log('Validando se a inscrição já existe');
    const existingInscription = await this.inscriptionGateway.findById(
      inscription.getId(),
    );

    if (existingInscription) {
      throw new SyncRecordAlreadyExistsUsecaseException(
        `Sync attempted for a record that already exists: ${inscription.getId()}`,
        'Registro ja sincronizado.',
        ReceiveSyncInscriptionUsecase.name,
      );
    }

    this.logger.log('Criando inscrição no banco');
    await this.inscriptionGateway.create(inscription);

    this.logger.log('inscrição criada com sucesso');
    const output: ReceiveSyncInscriptionOutput = {
      id: inscription.getId(),
      operation: 'created',
    };

    return output;
  }
}
