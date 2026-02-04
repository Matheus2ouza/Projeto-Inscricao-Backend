import { Injectable, Logger } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from 'src/usecases/web/exceptions/payment/payment-not-found.usecase.exception';

export type PaymentCanceledInput = {
  checkoutSession: string;
  externalReference: string;
};

export type PaymentCanceledOutput = {
  status: string;
  message: string;
};

@Injectable()
export class PaymentCanceledUseCase
  implements Usecase<PaymentCanceledInput, PaymentCanceledOutput>
{
  private readonly logger = new Logger(PaymentCanceledUseCase.name);
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(input: PaymentCanceledInput): Promise<PaymentCanceledOutput> {
    this.logger.log(
      `Iniciando cancelamento de pagamento para sessão: ${input.checkoutSession}`,
    );

    let payment = await this.paymentGateway.findByAsaasCheckout(
      input.checkoutSession,
    );

    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado via checkout session: ${input.checkoutSession}. Tentando via externalReference: ${input.externalReference}`,
      );
      payment = await this.paymentGateway.findByExternalReference(
        input.externalReference,
      );
    }

    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado para sessão: ${input.checkoutSession} e externalReference: ${input.externalReference}`,
      );
      throw new PaymentNotFoundUsecaseException(
        `Payment with checkout session ${input.checkoutSession} or external reference ${input.externalReference} not found`,
        `Pagamento não encontrado com a sessão de checkout ${input.checkoutSession} ou referência externa ${input.externalReference}`,
        PaymentCanceledUseCase.name,
      );
    }

    const inscription = await this.inscriptionGateway.findByPaymentId(
      payment.getId(),
    );

    if (inscription) {
      this.logger.log(
        `Inscrição encontrada (${inscription.getId()}). Decrementando valor pago.`,
      );
      inscription.decrementTotalPaid(payment.getTotalValue());
      await this.inscriptionGateway.update(inscription);
    }

    await this.paymentGateway.delete(payment.getId());
    this.logger.log(`Pagamento ${payment.getId()} deletado com sucesso.`);

    return {
      status: 'canceled',
      message: 'Pagamento cancelado com sucesso',
    };
  }
}
