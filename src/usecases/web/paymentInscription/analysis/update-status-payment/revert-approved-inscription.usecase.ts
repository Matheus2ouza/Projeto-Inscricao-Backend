import { Injectable } from '@nestjs/common';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InvalidPaymentIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/invalid-payment-id.usecase.exception';

export type RevertApprovedPaymentInput = {
  paymentId: string;
  rejectionReason?: string;
};

export type RevertApprovedPaymentOutput = {
  id: string;
  status: string;
};

@Injectable()
export class RevertApprovedPaymentUsecase
  implements Usecase<RevertApprovedPaymentInput, RevertApprovedPaymentOutput>
{
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  async execute(
    input: RevertApprovedPaymentInput,
  ): Promise<RevertApprovedPaymentOutput> {
    // Validar se o pagamento existe
    const payment = await this.paymentInscriptionGateway.findById(
      input.paymentId,
    );

    if (!payment) {
      throw new InvalidPaymentIdUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        RevertApprovedPaymentUsecase.name,
      );
    }

    const updatedPayment =
      await this.paymentInscriptionGateway.revertApprovedPayment(
        payment.getId(),
      );

    const output: RevertApprovedPaymentOutput = {
      id: updatedPayment.getId(),
      status: updatedPayment.getStatus(),
    };

    return output;
  }
}
