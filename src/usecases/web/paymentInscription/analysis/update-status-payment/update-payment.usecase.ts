import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PaymentApprovedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-approved-email.handler';
import { PaymentRejectedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-rejected-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { InvalidPaymentIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/invalid-payment-id.usecase.exception';

export type UpdatePaymentInput = {
  paymentId: string;
  statusPayment: StatusPayment;
  rejectionReason?: string;
};

export type UpdatePaymentOutput = {
  id: string;
  status: string;
};

@Injectable()
export class UpdatePaymentUsecase
  implements Usecase<UpdatePaymentInput, UpdatePaymentOutput>
{
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentApprovedEmailHandler: PaymentApprovedEmailHandler,
    private readonly paymentRejectedEmailHandler: PaymentRejectedEmailHandler,
  ) {}

  async execute(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Validar se o pagamento existe
    const payment = await this.paymentInscriptionGateway.findById(
      input.paymentId,
    );

    if (!payment) {
      throw new InvalidPaymentIdUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        UpdatePaymentUsecase.name,
      );
    }

    // Buscar dados da inscrição para o email
    const inscription = await this.inscriptionGateway.findById(
      payment.getInscriptionId(),
    );

    if (!inscription) {
      throw new InvalidPaymentIdUsecaseException(
        `Inscription with id ${payment.getInscriptionId()} not found`,
        'Inscrição não encontrada',
        UpdatePaymentUsecase.name,
      );
    }

    let updatedPayment;

    if (input.statusPayment === 'APPROVED') {
      // Aprovar o pagamento com transação atômica
      updatedPayment =
        await this.paymentInscriptionGateway.approvePaymentWithTransaction(
          payment.getId(),
        );

      // Enviar email de pagamento aprovado (não aguarda para não bloquear a resposta)
      this.sendApprovedEmail(payment, inscription).catch((error) => {
        console.error('Erro ao enviar email de pagamento aprovado:', error);
      });
    } else {
      updatedPayment = await this.paymentInscriptionGateway.rejectedPayment(
        payment.getId(),
        input.rejectionReason,
      );

      // Enviar email de pagamento reprovado (não aguarda para não bloquear a resposta)
      this.sendRejectedEmail(payment, inscription, input.rejectionReason).catch(
        (error) => {
          console.error('Erro ao enviar email de pagamento reprovado:', error);
        },
      );
    }

    const output: UpdatePaymentOutput = {
      id: updatedPayment.getId(),
      status: updatedPayment.getStatus(),
    };

    return output;
  }

  /**
   * Envia email de pagamento aprovado
   */
  private async sendApprovedEmail(
    payment: any,
    inscription: any,
  ): Promise<void> {
    const paymentEmailData = {
      paymentId: payment.getId(),
      inscriptionId: payment.getInscriptionId(),
      eventId: payment.getEventId(),
      responsibleName: inscription.getResponsible(),
      responsibleEmail: inscription.getEmail(),
      responsiblePhone: inscription.getPhone(),
      paymentValue: Number(payment.getValue()),
      paymentDate: payment.getCreatedAt(),
    };

    await this.paymentApprovedEmailHandler.sendPaymentApprovedEmail(
      paymentEmailData,
    );
  }

  /**
   * Envia email de pagamento reprovado
   */
  private async sendRejectedEmail(
    payment: any,
    inscription: any,
    rejectionReason?: string,
  ): Promise<void> {
    const paymentEmailData = {
      paymentId: payment.getId(),
      inscriptionId: payment.getInscriptionId(),
      eventId: payment.getEventId(),
      responsibleName: inscription.getResponsible(),
      responsibleEmail: inscription.getEmail(),
      responsiblePhone: inscription.getPhone(),
      paymentValue: Number(payment.getValue()),
      paymentDate: payment.getCreatedAt(),
      rejectionReason,
    };

    await this.paymentRejectedEmailHandler.sendPaymentRejectedEmail(
      paymentEmailData,
    );
  }
}
