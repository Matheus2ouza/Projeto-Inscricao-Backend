import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PaymentRejectedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-rejected-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { InvalidPaymentIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/invalid-payment-id.usecase.exception';
import { Logger } from '@nestjs/common';

export type RejectPaymentInput = {
  paymentId: string;
  rejectionReason?: string;
};

export type RejectPaymentOutput = {
  id: string;
  status: string;
};

@Injectable()
export class RejectPaymentUsecase
  implements Usecase<RejectPaymentInput, RejectPaymentOutput>
{
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentRejectedEmailHandler: PaymentRejectedEmailHandler,
  ) {}

  private readonly logger = new Logger(RejectPaymentUsecase.name);

  async execute(input: RejectPaymentInput): Promise<RejectPaymentOutput> {
    // Validar se o pagamento existe
    const payment = await this.paymentInscriptionGateway.findById(
      input.paymentId,
    );

    if (!payment) {
      throw new InvalidPaymentIdUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        RejectPaymentUsecase.name,
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
        RejectPaymentUsecase.name,
      );
    }

    const updatedPayment = await this.paymentInscriptionGateway.rejectedPayment(
      payment.getId(),
      input.rejectionReason,
    );

    // Enviar email de pagamento reprovado (não aguarda para não bloquear a resposta)
    void this.sendRejectedEmail(
      payment,
      inscription,
      input.rejectionReason,
    ).catch((error) => {
      this.logger.error(
        `(BG) Erro ao enviar email de pagamento reprovado para ${inscription.getEmail()}: ${error.message}`,
        error,
      );
    });

    const output: RejectPaymentOutput = {
      id: updatedPayment.getId(),
      status: updatedPayment.getStatus(),
    };

    return output;
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

    this.logger.log(
      `(BG) Enviando email de pagamento reprovado para ${inscription.getEmail()}...`,
    );

    await this.paymentRejectedEmailHandler.sendPaymentRejectedEmail(
      paymentEmailData,
    );

    this.logger.log(
      `(BG) Email de pagamento reprovado enviado para ${inscription.getEmail()} com sucesso`,
    );
  }
}
