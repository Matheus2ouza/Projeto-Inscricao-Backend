import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { InscriptionStatus, TransactionType } from 'generated/prisma';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';

export type PaymentReceivedInput = {
  asaasPaymentId: string;
  checkoutSession: string | null;
  billingType: string;
  value: number;
  netValue: number;
  confirmedDate: string;
  estimatedCreditDate: string;
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
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
  ) {}

  async execute(input: PaymentReceivedInput): Promise<PaymentReceivedOutput> {
    this.logger.log(
      `Recebendo confirmação - Asaas ID: ${input.asaasPaymentId}`,
    );

    const installment =
      await this.paymentInstallmentGateway.findByAsaasPaymentId(
        input.asaasPaymentId,
      );

    // Fluxo normal (cartão): installment já foi criado pelo PAYMENT_CONFIRMED
    if (installment) {
      const payment = await this.paymentGateway.findById(
        installment.getPaymentId(),
      );

      if (payment) {
        payment.setTotalReceived(installment.getNetValue());
        await this.paymentGateway.update(payment);
      }

      installment.setReceived(true);
      await this.paymentInstallmentGateway.update(installment);

      this.logger.log(`Parcela marcada como recebida: ${installment.getId()}`);
      return { status: 'updated', message: 'Parcela confirmada com sucesso' };
    }

    // Fluxo PIX: PAYMENT_CONFIRMED não veio, precisa rodar o fluxo completo aqui
    this.logger.log(
      `Installment não encontrado para ${input.asaasPaymentId}. Executando fluxo PIX via checkoutSession.`,
    );

    if (input.billingType !== 'PIX') {
      this.logger.warn(
        `billingType inválido para fluxo sem installment: ${input.billingType}`,
      );
      return {
        status: 'ignored',
        message:
          'Tipo de pagamento inválido para este fluxo, operação ignorada',
      };
    }

    if (!input.checkoutSession) {
      this.logger.warn(
        `Sem checkoutSession para Asaas ID: ${input.asaasPaymentId}`,
      );
      return {
        status: 'ignored',
        message: 'Parcela não encontrada, operação ignorada',
      };
    }

    const payment = await this.paymentGateway.findByAsaasCheckout(
      input.checkoutSession,
    );

    if (!payment) {
      this.logger.warn(
        `Payment não encontrado para checkoutSession: ${input.checkoutSession}`,
      );
      return {
        status: 'ignored',
        message: 'Pagamento não encontrado, operação ignorada',
      };
    }

    // Cria o movimento financeiro
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(input.netValue),
    });
    await this.financialMovementGateway.create(financialMovement);

    // Cria o installment já marcado como recebido
    const paymentInstallment = PaymentInstallment.create({
      paymentId: payment.getId(),
      installmentNumber: 1,
      value: input.value,
      netValue: input.netValue,
      asaasPaymentId: input.asaasPaymentId,
      financialMovementId: financialMovement.getId(),
      paidAt: new Date(input.confirmedDate),
      estimatedAt: new Date(input.estimatedCreditDate),
    });
    paymentInstallment.setReceived(true);
    await this.paymentInstallmentGateway.create(paymentInstallment);

    // Atualiza totais e aprova o pagamento
    payment.addPaidInstallment(
      paymentInstallment.getValue(),
      paymentInstallment.getNetValue(),
    );
    payment.setTotalReceived(paymentInstallment.getNetValue());
    payment.approve('WEBHOOK-ASAAS-PIX');

    // Libera inscrições
    const allocations = await this.paymentAllocationGateway.findByPaymentId(
      payment.getId(),
    );
    const event = await this.eventGateway.findById(payment.getEventId());
    let shouldUpdateEvent = false;

    for (const allocation of allocations) {
      const inscription = await this.inscriptionGateway.findById(
        allocation.getInscriptionId(),
      );
      if (!inscription) continue;

      if (
        inscription.getStatus() !== InscriptionStatus.PAID &&
        inscription.getTotalPaid() >= inscription.getTotalValue()
      ) {
        inscription.inscriptionPaid();
        await this.inscriptionGateway.update(inscription);

        if (event) {
          const count = await this.inscriptionGateway.countParticipants(
            inscription.getId(),
          );
          this.logger.log(
            `A quantiade de participantes: ${event.getQuantityParticipants()}`,
          );
          event.incrementQuantityParticipants(count);
          this.logger.log(
            `A quantiade de participantes apois a mudança: ${event.getQuantityParticipants()}`,
          );
          shouldUpdateEvent = true;
        }
      }
    }

    if (event) {
      // Logs para incrementAmountCollected
      this.logger.log(`Valor arrecadado antes: ${event.getAmountCollected()}`);
      event.incrementAmountCollected(paymentInstallment.getValue());
      this.logger.log(`Valor arrecadado depois: ${event.getAmountCollected()}`);

      // Logs para incrementAmountNetValueCollected
      this.logger.log(
        `Valor líquido arrecadado antes: ${event.getAmountNetValueCollected()}`,
      );
      event.incrementAmountNetValueCollected(paymentInstallment.getNetValue());
      this.logger.log(
        `Valor líquido arrecadado depois: ${event.getAmountNetValueCollected()}`,
      );

      shouldUpdateEvent = true;
    }

    if (event && shouldUpdateEvent) {
      await this.eventGateway.update(event);
    }

    await this.paymentGateway.update(payment);

    this.logger.log(
      `PIX ${input.asaasPaymentId} confirmado e recebido. Payment: ${payment.getId()}`,
    );
    return {
      status: 'updated',
      message: 'Parcela PIX confirmada e recebida com sucesso',
    };
  }
}
