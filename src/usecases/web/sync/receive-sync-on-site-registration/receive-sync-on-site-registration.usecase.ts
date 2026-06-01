import { Logger } from '@nestjs/common';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncOnSiteRegistrationInput = {
  onSiteRegistration: OnSiteRegistration;
};

export type ReceiveSyncOnSiteRegistrationOutput = {
  id: string;
  operation: 'created' | 'updated';
};

export class ReceiveSyncOnSiteRegistrationUsecase
  implements
    Usecase<
      ReceiveSyncOnSiteRegistrationInput,
      ReceiveSyncOnSiteRegistrationOutput
    >
{
  private readonly logger = new Logger(
    ReceiveSyncOnSiteRegistrationUsecase.name,
  );
  constructor(
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
  ) {}

  async execute(
    input: ReceiveSyncOnSiteRegistrationInput,
  ): Promise<ReceiveSyncOnSiteRegistrationOutput> {
    const onSiteRegistration = input.onSiteRegistration;

    this.logger.log('Validando se a inscrição já existe no banco');
    const existingOnSiteRegistration =
      await this.onSiteRegistrationGateway.findById(onSiteRegistration.getId());

    this.logger.log(
      `Inscrição Avulsa ${onSiteRegistration.getId()} ${existingOnSiteRegistration ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    await this.onSiteRegistrationGateway.upsert(onSiteRegistration);

    this.logger.log(`Inscrição sincronizada: ${onSiteRegistration.getId()}`);
    const output: ReceiveSyncOnSiteRegistrationOutput = {
      id: onSiteRegistration.getId(),
      operation: onSiteRegistration ? 'updated' : 'created',
    };

    return output;
  }
}
