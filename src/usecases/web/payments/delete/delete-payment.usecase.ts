import { Injectable } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { CardPaymentDeletionNotAllowedUsecaseException } from '../../exceptions/payment/card-payment-deletion-not-allowed.usecase.exception';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/paymentInscription/overpayment-not-allowed.usecase.exception';

export type DeletePaymentInput = {
  id: string;
};

@Injectable()
export class DeletePaymentUsecase implements Usecase<DeletePaymentInput, void> {
  public constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(input: DeletePaymentInput): Promise<void> {
    const payment = await this.paymentGateway.findById(input.id);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${input.id} not found`,
        'Pagamento não encontrado',
        DeletePaymentUsecase.name,
      );
    }

    if (payment.getMethodPayment() === PaymentMethod.CARTAO) {
      throw new CardPaymentDeletionNotAllowedUsecaseException(
        `Attempted to delete a card payment with id ${input.id}`,
        'Para excluir um pagamento com método de cartão, é necessário entrar em contato com o suporte',
        DeletePaymentUsecase.name,
      );
    }

    if (payment.getStatus() === StatusPayment.APPROVED) {
      throw new OverpaymentNotAllowedUsecaseException(
        `An attempt to delete a payment, but it had already been approved: ${payment.getId()}`,
        `Seu pagamento já foi aprovado, para apaga-lo entre em contato com o suporte`,
        DeletePaymentUsecase.name,
      );
    }

    // Busca as alocações do pagamento
    const paymentAllocations =
      await this.paymentAllocationGateway.findByPaymentId(payment.getId());

    const inscriptionsIds = paymentAllocations.map((allocation) =>
      allocation.getInscriptionId(),
    );

    const inscriptions =
      await this.inscriptionGateway.findManyByIds(inscriptionsIds);

    const inscriptionsMap = new Map(
      inscriptions.map((inscription) => [inscription.getId(), inscription]),
    );

    const participantsToDecrement: string[] = [];

    // Para cada alocação é buscada a Inscrição associada
    for (const allocation of paymentAllocations) {
      const inscription = inscriptionsMap.get(allocation.getInscriptionId());

      if (!inscription) continue;

      const wasPaid = inscription.getStatus() === InscriptionStatus.PAID;

      inscription.decrementTotalPaid(allocation.getValue());

      if (inscription.getTotalPaid() < inscription.getTotalValue()) {
        inscription.inscriptionUnpaid();

        if (payment.getStatus() === StatusPayment.APPROVED && wasPaid) {
          participantsToDecrement.push(inscription.getId());
        }
      }

      await this.inscriptionGateway.update(inscription);
    }

    if (
      payment.getStatus() === StatusPayment.APPROVED &&
      participantsToDecrement.length > 0
    ) {
      const participantsCounts = await Promise.all(
        participantsToDecrement.map((id) =>
          this.inscriptionGateway.countParticipants(id),
        ),
      );
      const totalParticipantsToDecrement = participantsCounts.reduce(
        (sum, count) => sum + count,
        0,
      );
      if (totalParticipantsToDecrement > 0) {
        await this.eventGateway.decrementQuantityParticipants(
          payment.getEventId(),
          totalParticipantsToDecrement,
        );
      }
    }

    if (payment.getStatus() === StatusPayment.APPROVED) {
      const PaymentInstallments =
        await this.paymentInstallmentGateway.findByPaymentId(payment.getId());

      // Deletar as parcelas do pagamento e logo em seguida os movimentos financeiros associados
      await this.paymentInstallmentGateway.deleteMany(payment.getId());
      await this.financialMovementGateway.deleteMany(
        PaymentInstallments.map(
          (installment) => installment.getFinancialMovementId()!,
        ),
      );

      await this.eventGateway.decrementAmountCollected(
        payment.getEventId(),
        payment.getTotalValue(),
      );
    }

    // Deleta a imagem do pagamento do bucket do supabase
    await this.supabaseStorageService.deleteFile(payment.getImageUrl());
    // Deleta o pagamento
    await this.paymentGateway.delete(payment.getId());
  }
}
