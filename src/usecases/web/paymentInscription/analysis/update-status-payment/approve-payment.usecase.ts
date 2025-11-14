import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PaymentApprovedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-approved-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { InvalidPaymentIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/invalid-payment-id.usecase.exception';

export type ApprovePaymentInput = {
  paymentId: string;
  rejectionReason?: string;
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
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentApprovedEmailHandler: PaymentApprovedEmailHandler,
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

    // Buscar dados da inscrição para o email
    const inscription = await this.inscriptionGateway.findById(
      payment.getInscriptionId(),
    );

    if (!inscription) {
      throw new InvalidPaymentIdUsecaseException(
        `Inscription with id ${payment.getInscriptionId()} not found`,
        'Inscrição não encontrada',
        ApprovePaymentUsecase.name,
      );
    }

    // Aprovar o pagamento com transação atômica
    const updatedPayment =
      await this.paymentInscriptionGateway.approvePaymentWithTransaction(
        payment.getId(),
      );

    // Enviar email de pagamento aprovado (não aguarda para não bloquear a resposta)
    this.sendApprovedEmail(payment, inscription).catch((error) => {
      console.error('Erro ao enviar email de pagamento aprovado:', error);
    });

    const output: ApprovePaymentOutput = {
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
}
