import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';

export type PaymentReprovedInput = {
  checkoutSession: string;
  asaasPaymentId: string;
  externalReference: string;
};

export type PaymentReprovedOutput = {
  status: string;
  message: string;
};

@Injectable()
export class PaymentReprovedUsecase
  implements Usecase<PaymentReprovedInput, PaymentReprovedOutput>
{
  private readonly logger = new Logger(PaymentReprovedUsecase.name);
  constructor(private readonly paymentGateway: PaymentGateway) {}

  async execute(input: PaymentReprovedInput): Promise<PaymentReprovedOutput> {
    this.logger.log(
      `Iniciando reprovação de pagamento para sessão: ${input.checkoutSession}`,
    );

    // Tentar encontrar o payment via checkoutSession
    let payment = await this.paymentGateway.findByAsaasCheckout(
      input.checkoutSession,
    );

    // Caso não encontre pelo checkoutSession, tentar pela externalReference
    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado via checkout session: ${input.checkoutSession}. Tentando via externalReference: ${input.externalReference}`,
      );
      payment = await this.paymentGateway.findByExternalReference(
        input.externalReference,
      );
    }

    // Caso não encontre nem pelo checkoutSession nem pela externalReference então ignorar
    if (!payment) {
      this.logger.warn(
        `Pagamento não encontrado para sessão: ${input.checkoutSession} e externalReference: ${input.externalReference}`,
      );
      return {
        status: 'ignored',
        message: 'Pagamento não encontrado, operação ignorada',
      };
    }

    return {
      status: 'reproved',
      message: 'Pagamento reprovado com sucesso',
    };
  }
}
