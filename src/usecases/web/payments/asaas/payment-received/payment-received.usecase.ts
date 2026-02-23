import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';

export type PaymentReceivedInput = {
  asaasPaymentId: string;
};

export type PaymentReceivedOutput = {
  status: string;
  message: string;
};

@Injectable()
export class PaymentReceivedUsecase
  implements Usecase<PaymentReceivedInput, PaymentReceivedOutput>
{
  private readonly logger = new Logger(PaymentReceivedUsecase.name);

  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
  ) {}

  async execute(input: PaymentReceivedInput): Promise<PaymentReceivedOutput> {
    this.logger.log(
      `Recebendo confirmação - Asaas ID: ${input.asaasPaymentId}`,
    );

    const installment =
      await this.paymentInstallmentGateway.findByAsaasPaymentId(
        input.asaasPaymentId,
      );

    if (!installment) {
      this.logger.warn(
        `Parcela não encontrada para Asaas ID: ${input.asaasPaymentId}`,
      );
      const output: PaymentReceivedOutput = {
        status: 'ignored',
        message: 'Parcela não encontrada, operação ignorada',
      };

      return output;
    }

    const payment = await this.paymentGateway.findById(
      installment.getPaymentId(),
    );

    if (payment) {
      this.logger.log(
        `Pagamento encontrado: ${JSON.stringify(payment, null, 2)}`,
      );
      this.logger.log(
        `Incrementando o valor liberado da parcela ${installment.getId()}`,
      );
      this.logger.log(`Valor liberado antes: ${payment.getTotalReceived()}`);
      payment.setTotalReceived(installment.getNetValue());
      this.logger.log(`Valor liberado depois: ${payment.getTotalReceived()}`);
      await this.paymentGateway.update(payment);

      const event = await this.eventGateway.findById(payment.getEventId());

      if (event) {
        this.logger.log(`Evento encontrado: ${JSON.stringify(event, null, 2)}`);
        this.logger.log(
          `Incrementando o valor arrecadado pela parcela ${installment.getId()}`,
        );
        this.logger.log(
          `Valor arrecadado antes: ${event.getAmountCollected()}`,
        );
        event.incrementAmountCollected(installment.getNetValue());
        this.logger.log(
          `Valor arrecadado depois: ${event.getAmountCollected()}`,
        );
        await this.eventGateway.update(event);
      }
    }

    installment.setReceived(true);
    await this.paymentInstallmentGateway.update(installment);

    this.logger.log(
      `Parcela marcada como recebida: ${installment.getId()} (Asaas ID: ${input.asaasPaymentId})`,
    );

    const output: PaymentReceivedOutput = {
      status: 'updated',
      message: 'Parcela confirmada com sucesso',
    };

    return output;
  }
}
