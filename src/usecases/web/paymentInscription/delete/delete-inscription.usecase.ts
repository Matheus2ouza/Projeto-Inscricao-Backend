import { Injectable } from '@nestjs/common';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { InvalidPaymentIdUsecaseException } from '../../exceptions/paymentInscription/invalid-payment-id.usecase.exception';

export type DeletePaymentInscriptionInput = {
  paymentInscriptionId: string;
};

@Injectable()
export class DeletePaymentInscriptionUsecase {
  public constructor(
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(input: DeletePaymentInscriptionInput) {
    const payment = await this.paymentInscriptionGateway.findById(
      input.paymentInscriptionId,
    );

    if (!payment) {
      throw new InvalidPaymentIdUsecaseException(
        `Payment with id ${input.paymentInscriptionId} not found`,
        'Pagamento não encontrado',
        DeletePaymentInscriptionUsecase.name,
      );
    }

    if (payment.getStatus() === 'APPROVED') {
      await this.paymentInscriptionGateway.revertApprovedPayment(
        input.paymentInscriptionId,
      );
    }

    if (payment.getImageUrl()) {
      await this.supabaseStorageService.deleteFile(payment.getImageUrl());
    }

    await this.paymentInscriptionGateway.deletePayment(
      input.paymentInscriptionId,
    );
  }
}
