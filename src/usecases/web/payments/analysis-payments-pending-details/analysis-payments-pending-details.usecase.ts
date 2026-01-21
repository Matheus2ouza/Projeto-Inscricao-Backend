import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type AnalysisPaymentsPendingDetailsInput = {
  paymentId: string;
};

export type AnalysisPaymentsPendingDetailsOutput = {
  id: string;
  status: string;
  methodPayment: PaymentMethod;
  totalValue: number;
  createdAt: Date;
  imageUrl: string;
  rejectionReason?: string;
  allocation?: PaymentAllocation[];
};

type PaymentAllocation = {
  value: number;
  inscriptionId: string;
};

@Injectable()
export class AnalysisPaymentsPendingDetailsUsecase
  implements
    Usecase<
      AnalysisPaymentsPendingDetailsInput,
      AnalysisPaymentsPendingDetailsOutput
    >
{
  public constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: AnalysisPaymentsPendingDetailsInput,
  ): Promise<AnalysisPaymentsPendingDetailsOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);
    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `attempt to analysis payment pending details for payment: ${input.paymentId} but it was not found`,
        'Pagamento não encontrado',
        AnalysisPaymentsPendingDetailsUsecase.name,
      );
    }

    const paymentAllocation =
      await this.paymentAllocationGateway.findByPaymentId(payment.getId());

    const imagePath = await this.getPublicUrlOrEmpty(payment.getImageUrl());

    const allocation = paymentAllocation?.map((a) => ({
      value: a.getValue(),
      inscriptionId: a.getInscriptionId(),
    }));

    const output: AnalysisPaymentsPendingDetailsOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
      methodPayment: payment.getMethodPayment(),
      totalValue: payment.getTotalValue(),
      createdAt: payment.getCreatedAt(),
      imageUrl: imagePath,
      rejectionReason: payment.getRejectionReason(),
      allocation: allocation,
    };

    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }
}
