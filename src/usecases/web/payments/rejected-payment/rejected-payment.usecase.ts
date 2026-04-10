import { Injectable, Logger } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { Payment } from 'src/domain/entities/payment.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PaymentRejectedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-rejected-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

type ResponsibleContact = {
  name: string;
  email: string;
};

export type RejectedPaymentInput = {
  paymentId: string;
  accountId: string;
  rejectionReason: string;
};

export type RejectedPaymentOutput = {
  id: string;
  status: StatusPayment;
};

@Injectable()
export class RejectedPaymentUsecase
  implements Usecase<RejectedPaymentInput, RejectedPaymentOutput>
{
  private readonly logger = new Logger(RejectedPaymentUsecase.name);

  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountGateway: AccountGateway,
    private readonly paymentRejectedEmailHandler: PaymentRejectedEmailHandler,
  ) {}

  async execute(input: RejectedPaymentInput): Promise<RejectedPaymentOutput> {
    this.logger.log(`Recusando pagamento ${input.paymentId}`);

    const payment = await this.getPaymentOrThrow(input.paymentId);
    const allocations = await this.paymentAllocationGateway.findByPaymentId(
      payment.getId(),
    );

    payment.recuse(input.rejectionReason);
    await this.paymentGateway.update(payment);

    await this.sendRejectedEmailForAllocations(
      payment,
      allocations,
      input.rejectionReason,
    );

    return {
      id: payment.getId(),
      status: payment.getStatus(),
    };
  }

  private async getPaymentOrThrow(paymentId: string): Promise<Payment> {
    const payment = await this.paymentGateway.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${paymentId} not found`,
        'Pagamento não encontrado',
        RejectedPaymentUsecase.name,
      );
    }

    return payment;
  }

  private async sendRejectedEmailForAllocations(
    payment: Payment,
    allocations: PaymentAllocation[],
    rejectionReason: string,
  ): Promise<void> {
    const inscriptionIds = this.getUniqueInscriptionIds(allocations);

    if (inscriptionIds.length === 0) {
      return;
    }

    const baseResponsible = await this.resolveResponsibleFromPayment(payment);

    for (const inscriptionId of inscriptionIds) {
      const responsible = await this.resolveResponsibleForInscription(
        inscriptionId,
        baseResponsible,
      );

      if (!responsible.email) {
        this.logger.warn(
          `Email do responsável não encontrado para pagamento ${payment.getId()} (Inscrição: ${inscriptionId})`,
        );
        continue;
      }

      this.logger.log(
        `Enviando email de rejeição de pagamento para ${responsible.email} (Inscrição: ${inscriptionId})`,
      );

      await this.paymentRejectedEmailHandler.sendPaymentRejectedEmail({
        paymentId: payment.getId(),
        inscriptionId,
        eventId: payment.getEventId(),
        responsibleName: responsible.name,
        responsibleEmail: responsible.email,
        paymentValue: payment.getTotalValue(),
        paymentDate: new Date(),
        rejectionReason,
      });
    }
  }

  private async resolveResponsibleFromPayment(
    payment: Payment,
  ): Promise<ResponsibleContact> {
    if (payment.getIsGuest()) {
      return {
        name: payment.getGuestName() || '',
        email: payment.getGuestEmail() || '',
      };
    }

    const accountId = payment.getAccountId();
    if (!accountId) {
      return { name: '', email: '' };
    }

    const account = await this.accountGateway.findById(accountId);
    return {
      name: account?.getUsername() || '',
      email: account?.getEmail() || '',
    };
  }

  private async resolveResponsibleForInscription(
    inscriptionId: string,
    baseResponsible: ResponsibleContact,
  ): Promise<ResponsibleContact> {
    if (baseResponsible.name && baseResponsible.email) {
      return baseResponsible;
    }

    const inscription = await this.inscriptionGateway.findById(inscriptionId);
    return {
      name: baseResponsible.name || inscription?.getResponsible() || '',
      email: baseResponsible.email || inscription?.getEmail() || '',
    };
  }

  private getUniqueInscriptionIds(allocations: PaymentAllocation[]): string[] {
    return [
      ...new Set(
        allocations.map((allocation) => allocation.getInscriptionId()),
      ),
    ];
  }
}
