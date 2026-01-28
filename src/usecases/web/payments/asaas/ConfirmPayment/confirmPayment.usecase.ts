import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  PaymentMethod,
  StatusPayment,
  TransactionType,
} from 'generated/prisma';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from 'src/usecases/web/exceptions/payment/payment-not-found.usecase.exception';

export type ConfirmPaymentInput = {
  checkoutSession: string;
  asaasPaymentId: string;
  description: string;
  installmentNumber: number;
  value: number;
  netValue: number;
  confirmedDate: string;
};

export type ConfirmPaymentOutput = {
  id: string;
  status: StatusPayment;
  totalValue: number;
  totalPaid: number;
  totalNetValue: number;
  paidInstallments: number;
  installments: number;
};

@Injectable()
export class ConfirmPaymentUsecase
  implements Usecase<ConfirmPaymentInput, ConfirmPaymentOutput>
{
  private readonly logger = new Logger(ConfirmPaymentUsecase.name);

  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
  ) {}

  async execute(input: ConfirmPaymentInput): Promise<ConfirmPaymentOutput> {
    this.logger.log(
      `📨 Confirmando parcela ${input.installmentNumber} - Asaas ID: ${input.asaasPaymentId}`,
    );

    // ✅ 1. BUSCAR PAYMENT PELO checkoutSession
    const payment = await this.paymentGateway.findByAsaasCheckout(
      input.checkoutSession,
    );

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with checkoutSession ${input.checkoutSession} not found.`,
        `Pagamento não encontrado.`,
        ConfirmPaymentUsecase.name,
      );
    }

    this.logger.log(`✅ Payment encontrado: ${payment.getId()}`);

    // ✅ 1.5. VALIDAR DESCRIÇÃO E ATUALIZAR TOTAL DE PARCELAS SE FOR A PRIMEIRA
    if (input.description) {
      const match = input.description.match(/Parcela (\d+) de (\d+)/i);
      if (match) {
        const currentInstallment = parseInt(match[1], 10);
        const totalInstallments = parseInt(match[2], 10);

        if (currentInstallment === 1) {
          this.logger.log(
            `🔄 Atualizando total de parcelas para ${totalInstallments} (detectado na descrição)`,
          );
          payment.setInstallments(totalInstallments);
        }
      }
    }

    // ✅ 2. VERIFICAR SE ESTA PARCELA JÁ FOI PAGA (evitar duplicação)
    const installmentAlreadyPaid =
      await this.paymentInstallmentGateway.findByAsaasPaymentId(
        input.asaasPaymentId,
      );

    if (installmentAlreadyPaid) {
      this.logger.warn(
        `⚠️ Parcela ${input.installmentNumber} já foi paga anteriormente!`,
      );
      return {
        id: payment.getId(),
        status: payment.getStatus(),
        totalValue: payment.getTotalValue(),
        totalPaid: payment.getTotalPaid(),
        totalNetValue: payment.getTotalNetValue(),
        paidInstallments: payment.getPaidInstallments(),
        installments: payment.getInstallments(),
      };
    }

    // Cria o movimento financeiro para esta parcela, registra com o valor líquido
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(input.netValue),
    });

    await this.financialMovementGateway.create(financialMovement);

    this.logger.log(
      `💰 Movimento financeiro criado: R$ ${input.netValue.toFixed(2)} (parcela ${input.installmentNumber})`,
    );

    // Registra a parcela paga, associando ao movimento financeiro já criado acima
    const paymentInstallment = PaymentInstallment.create({
      paymentId: payment.getId(),
      installmentNumber: input.installmentNumber,
      value: input.value,
      netValue: input.netValue,
      asaasPaymentId: input.asaasPaymentId,
      financialMovementId: financialMovement.getId(),
      paidAt: new Date(input.confirmedDate),
    });

    await this.paymentInstallmentGateway.create(paymentInstallment);

    // ✅ 5. ATUALIZAR PAYMENT
    payment.addPaidInstallment(input.value, input.netValue);

    this.logger.log(
      `💰 Parcela ${input.installmentNumber}/${payment.getInstallments()} paga! ` +
        `Valor bruto: R$ ${input.value.toFixed(2)} | ` +
        `Valor líquido: R$ ${input.netValue.toFixed(2)} | ` +
        `Total pago: R$ ${payment.getTotalPaid().toFixed(2)} | ` +
        `Total líquido: R$ ${payment.getTotalNetValue().toFixed(2)}`,
    );

    // ✅ 6. VERIFICAR SE DEVE LIBERAR AS INSCRIÇÕES (Totalmente pago ou Cartão Confirmado)
    const isCreditCard = payment.getMethodPayment() === PaymentMethod.CARTAO;
    const shouldReleaseInscription =
      payment.isFullyPaid() ||
      (isCreditCard && payment.getPaidInstallments() >= 1);

    if (shouldReleaseInscription) {
      if (payment.isFullyPaid()) {
        this.logger.log(`🎉 TODAS AS PARCELAS FORAM PAGAS!`);
      } else {
        this.logger.log(
          `🎉 Pagamento via CARTÃO confirmado na parcela ${input.installmentNumber}. Liberando inscrições...`,
        );
      }

      // Se for cartão e ainda não estiver aprovado, aprova o pagamento (transação aceita)
      if (
        payment.getStatus() !== StatusPayment.APPROVED &&
        shouldReleaseInscription
      ) {
        payment.approve('WEBHOOK-ASAAS');
      }

      const allocations = await this.paymentAllocationGateway.findByPaymentId(
        payment.getId(),
      );

      this.logger.log(
        `💰 Total de alocações encontradas: ${allocations.length}`,
      );

      for (const allocation of allocations) {
        const inscription = await this.inscriptionGateway.findById(
          allocation.getInscriptionId(),
        );

        if (!inscription) continue;

        // Se for cartão, libera independente do valor total pago na inscrição (pois o cartão garante)
        // Se não for cartão, mantém a verificação do valor total
        if (
          isCreditCard ||
          inscription.getTotalPaid() >= inscription.getTotalValue()
        ) {
          inscription.inscriptionPaid();
          await this.inscriptionGateway.update(inscription);

          this.logger.log(
            `✅ Inscrição ${inscription.getId()} marcada como PAGA`,
          );
        }
      }
      this.logger.log(
        `✅ Payment ${payment.getId()} APROVADO! ` +
          `Total recebido: R$ ${payment.getTotalNetValue().toFixed(2)}`,
      );
    } else {
      this.logger.log(
        `⏳ Aguardando mais ${payment.getInstallments() - payment.getPaidInstallments()} parcela(s)...`,
      );
    }

    // ✅ 7. SALVAR PAYMENT ATUALIZADO
    await this.paymentGateway.update(payment);

    return {
      id: payment.getId(),
      status: payment.getStatus(),
      totalValue: payment.getTotalValue(),
      totalPaid: payment.getTotalPaid(),
      totalNetValue: payment.getTotalNetValue(),
      paidInstallments: payment.getPaidInstallments(),
      installments: payment.getInstallments(),
    };
  }
}
