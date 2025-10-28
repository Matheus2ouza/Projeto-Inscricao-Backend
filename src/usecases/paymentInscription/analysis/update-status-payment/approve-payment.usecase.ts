import { Injectable } from '@nestjs/common';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { InvalidPaymentIdUsecaseException } from 'src/usecases/exceptions/paymentInscription/invalid-payment-id.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type ApprovePaymentInput = {
  paymentId: string;
};

export type ApprovePaymentOutput = {
  id: string;
  status: string;
};

@Injectable()
export class ApprovePaymentUsecase
  implements Usecase<ApprovePaymentInput, ApprovePaymentOutput>
{
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  async execute(input: ApprovePaymentInput): Promise<ApprovePaymentOutput> {
    // Validar se o pagamento existe
    const payment = await this.paymentInscriptionGateway.findById(
      input.paymentId,
    );

    if (!payment) {
      throw new InvalidPaymentIdUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        ApprovePaymentUsecase.name,
      );
    }

    // Aprovar o pagamento com transação atômica
    const approvedPayment =
      await this.paymentInscriptionGateway.approvePaymentWithTransaction(
        payment.getId(),
      );

    const output: ApprovePaymentOutput = {
      id: approvedPayment.getId(),
      status: approvedPayment.getStatus(),
    };

    return output;
  }
}
