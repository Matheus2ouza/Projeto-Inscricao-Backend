import { Injectable, Logger } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';

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

    // Busca a inscrição associada ao pagamento pra decrementar o valor pago
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

    // Deleta o pagamento, não precisa apagar o paymentAllocation porque ele é deletado automaticamente
    // por causa do onDelete: 'cascade' na entidade PaymentAllocation
    await this.paymentGateway.delete(payment.getId());
    this.logger.log(`Pagamento ${payment.getId()} deletado com sucesso.`);

    return {
      status: 'canceled',
      message: 'Pagamento cancelado com sucesso',
    };
  }
}
