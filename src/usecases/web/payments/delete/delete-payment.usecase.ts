import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
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
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
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

    const allocations = await this.paymentAllocationGateway.findByPaymentId(
      payment.getId(),
    );

    const inscriptionIds = allocations.map((allocation) =>
      allocation.getInscriptionId(),
    );

    const inscriptions =
      await this.inscriptionGateway.findManyByIds(inscriptionIds);

    await Promise.all(
      inscriptions.map(async (i) => {
        i.decrementTotalPaid(payment.getTotalValue());
        return i.getAccountId();
      }),
    );

    await this.paymentGateway.delete(payment.getId());
    if (payment.getImageUrl()) {
      await this.supabaseStorageService.deleteFile(payment.getImageUrl());
    }
  }
}
