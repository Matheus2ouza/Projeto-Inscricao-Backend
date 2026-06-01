import { Logger } from '@nestjs/common';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { Usecase } from 'src/usecases/usecase';

export type ReceiveSyncOnSiteParticipantPaymentInput = {
  onSiteParticipantPayment: OnSiteParticipantPayment;
};

export type ReceiveSyncOnSiteParticipantPaymentOutput = {
  id: string;
  operation: 'created' | 'updated';
};

export class ReceiveSyncOnSiteParticipantPaymentUsecase
  implements
    Usecase<
      ReceiveSyncOnSiteParticipantPaymentInput,
      ReceiveSyncOnSiteParticipantPaymentOutput
    >
{
  private readonly logger = new Logger(
    ReceiveSyncOnSiteParticipantPaymentUsecase.name,
  );
  constructor(
    private readonly onSiteParticipantPaymentGateway: OnSiteParticipantPaymentGateway,
  ) {}

  async execute(
    input: ReceiveSyncOnSiteParticipantPaymentInput,
  ): Promise<ReceiveSyncOnSiteParticipantPaymentOutput> {
    const onSiteParticipantPayment = input.onSiteParticipantPayment;

    this.logger.log('Validando se o pagamento já existe no banco');
    const existingOnSiteParticipantPayment =
      await this.onSiteParticipantPaymentGateway.findById(
        onSiteParticipantPayment.getId(),
      );

    this.logger.log(
      `Pagamento ${onSiteParticipantPayment.getId()} ${existingOnSiteParticipantPayment ? 'já existe — atualizando' : 'não encontrado — criando'}`,
    );

    await this.onSiteParticipantPaymentGateway.upsert(onSiteParticipantPayment);

    this.logger.log(
      `Pagamento sincronizado: ${onSiteParticipantPayment.getId()}`,
    );
    const output: ReceiveSyncOnSiteParticipantPaymentOutput = {
      id: onSiteParticipantPayment.getId(),
      operation: existingOnSiteParticipantPayment ? 'updated' : 'created',
    };

    return output;
  }
}
