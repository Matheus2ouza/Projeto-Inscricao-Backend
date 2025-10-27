import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { InscriptionHasPaymentUsecaseException } from 'src/usecases/exceptions/inscription/delete/inscription-has-payment.usecase.exception';
import { inscriptionNotFoundUsecaseException } from 'src/usecases/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type DeleteInscriptionInput = {
  inscriptionId: string;
};

@Injectable()
export class DeleteInscriptionUsecase {
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly ParticipantGateway: ParticipantGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  async execute(input: DeleteInscriptionInput) {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new inscriptionNotFoundUsecaseException(
        `attempt to search for registration data for analysis but the registration was not found, id: ${input.inscriptionId}`,
        `Inscrição não encontrada`,
        DeleteInscriptionUsecase.name,
      );
    }

    const payment = await this.paymentInscriptionGateway.findbyInscriptionId(
      inscription.getId(),
    );

    if (payment && payment.length >= 1) {
      throw new InscriptionHasPaymentUsecaseException(
        `attempt to delete inscription ${input.inscriptionId} that already has linked payments`,
        `Não é possível excluir uma inscrição que já possui pagamentos vinculados.`,
        DeleteInscriptionUsecase.name,
      );
    }

    const countParticipants =
      await this.ParticipantGateway.countByInscriptionId(input.inscriptionId);

    await this.inscriptionGateway.deleteInscription(input.inscriptionId);

    await this.eventGateway.decremntQuantityParticipants(
      inscription.getEventId(),
      countParticipants,
    );
  }
}
