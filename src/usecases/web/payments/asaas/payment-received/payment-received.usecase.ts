import { Injectable, Logger } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
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
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
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

      if (!event) {
        this.logger.warn(
          `Evento não encontrado para pagamento ${payment.getId()} (Event ID: ${payment.getEventId()})`,
        );

        installment.setReceived(true);
        await this.paymentInstallmentGateway.update(installment);

        const output: PaymentReceivedOutput = {
          status: 'ignored',
          message: 'Evento não encontrado, operação ignorada',
        };

        return output;
      }

      const cashRegisterEvent =
        await this.cashRegisterEventGateway.findByEventId(payment.getEventId());

      if (cashRegisterEvent.length > 0) {
        const entries = cashRegisterEvent.map((c) =>
          CashRegisterEntry.create({
            cashRegisterId: c.getCashRegisterId(),
            type: CashEntryType.INCOME,
            origin: CashEntryOrigin.ASAAS,
            method: PaymentMethod.CARTAO,
            value: installment.getNetValue(),
            description: `Pagamento Cartão ${payment.getId()}`,
            eventId: payment.getEventId(),
            paymentInstallmentId: installment.getId(),
            responsible: 'WEBHOOK-ASAAS',
          }),
        );

        await this.cashRegisterEntryGateway.createMany(entries);
        await this.updateCashRegisterBalances(entries);
      }

      this.logger.log(`Evento encontrado: ${event.getName()}`);
      this.logger.log(
        `Incrementando o valor arrecadado pela parcela ${installment.getId()}`,
      );
      this.logger.log(`Valor arrecadado antes: ${event.getAmountCollected()}`);
      event.incrementAmountCollected(installment.getNetValue());
      this.logger.log(`Valor arrecadado depois: ${event.getAmountCollected()}`);
      await this.eventGateway.update(event);
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

  private async updateCashRegisterBalances(
    entries: CashRegisterEntry[],
  ): Promise<void> {
    const deltaByCashRegisterId = new Map<string, number>();

    for (const entry of entries) {
      const cashRegisterId = entry.getCashRegisterId();
      const previous = deltaByCashRegisterId.get(cashRegisterId) ?? 0;
      const delta =
        entry.getType() === CashEntryType.INCOME
          ? entry.getValue()
          : -entry.getValue();

      deltaByCashRegisterId.set(cashRegisterId, previous + delta);
    }

    await Promise.all(
      [...deltaByCashRegisterId.entries()].map(
        async ([cashRegisterId, delta]) => {
          if (delta === 0) return;
          const cashRegister =
            await this.cashRegisterGateway.findById(cashRegisterId);
          if (!cashRegister) return;

          if (delta > 0) {
            cashRegister.incrementBalance(delta);
          } else {
            cashRegister.decrementBalance(-delta);
          }

          await this.cashRegisterGateway.update(cashRegister);
        },
      ),
    );
  }
}
