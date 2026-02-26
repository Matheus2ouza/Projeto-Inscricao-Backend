import { Injectable } from '@nestjs/common';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { InscriptionHasPaymentUsecaseException } from 'src/usecases/web/exceptions/inscription/delete/inscription-has-payment.usecase.exception';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type DeleteInscriptionInput = {
  inscriptionId: string;
};

@Injectable()
export class DeleteInscriptionUsecase {
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
  ) {}

  async execute(input: DeleteInscriptionInput) {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to search for registration data for analysis but the registration was not found, id: ${input.inscriptionId}`,
        `Inscrição não encontrada`,
        DeleteInscriptionUsecase.name,
      );
    }

    const payment = await this.paymentAllocationGateway.findbyInscriptionId(
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
      await this.accountParticipantInEventGateway.countByInscriptionId(
        inscription.getId(),
      );

    await this.eventGateway.decrementQuantityParticipants(
      inscription.getEventId(),
      countParticipants,
    );

    await this.inscriptionGateway.delete(inscription.getId());
  }
}
