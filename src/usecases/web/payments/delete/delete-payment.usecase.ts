import { Injectable } from '@nestjs/common';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { PaymentApprovedUsecaseException } from '../../exceptions/payment/payment-approved.usecase.exception';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type DeletePaymentInput = {
  paymentId: string;
};

@Injectable()
export class DeletePaymentUsecase implements Usecase<DeletePaymentInput, void> {
  public constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(input: DeletePaymentInput): Promise<void> {
    const payment = await this.paymentGateway.findById(input.paymentId);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        DeletePaymentUsecase.name,
      );
    }

    if (payment.getStatus() == 'APPROVED') {
      throw new PaymentApprovedUsecaseException(
        `Payment with id ${input.paymentId} is approved`,
        'Pagamento já foi aprovado',
        DeletePaymentUsecase.name,
      );
    }
    await this.paymentGateway.delete(payment.getId());
    await this.supabaseStorageService.deleteFile(payment.getImageUrl());
  }
}
