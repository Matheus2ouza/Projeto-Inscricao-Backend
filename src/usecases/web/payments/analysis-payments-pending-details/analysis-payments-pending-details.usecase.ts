import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
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
  isGuest: boolean;
  responsible: string;
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
  responsible?: string;
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
    private readonly accountGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
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

    const imagePath = await this.getPublicUrl(payment.getImageUrl());

    // Mapeando alocações e buscando responsável da inscrição
    const allocation = await Promise.all(
      (paymentAllocation || []).map(async (a) => {
        const inscription = await this.inscriptionGateway.findById(
          a.getInscriptionId(),
        );

        let responsible = 'Responsável não encontrado';

        if (inscription) {
          if (inscription.getIsGuest()) {
            responsible = inscription.getGuestName() || 'Convidado sem nome';
          }

          if (!inscription.getIsGuest()) {
            const accountId = inscription.getAccountId();
            if (accountId) {
              const account = await this.accountGateway.findById(accountId);
              responsible = account?.getUsername() || 'Usuário não encontrado';
            }
          }
        }

        return {
          value: a.getValue(),
          inscriptionId: a.getInscriptionId(),
          responsible,
        };
      }),
    );

    // Definindo o responsável pelo pagamento (Payer)
    let responsible = 'Usuário não encontrado';

    if (payment.getIsGuest()) {
      responsible = payment.getGuestName() || 'Convidado sem nome';
    }

    if (!payment.getIsGuest()) {
      const accountId = payment.getAccountId();
      if (accountId) {
        const account = await this.accountGateway.findById(accountId);
        responsible = account?.getUsername() || 'Usuário não encontrado';
      }
    }

    const output: AnalysisPaymentsPendingDetailsOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
      isGuest: payment.getIsGuest() || false,
      responsible,
      methodPayment: payment.getMethodPayment(),
      totalValue: payment.getTotalValue(),
      createdAt: payment.getCreatedAt(),
      imageUrl: imagePath,
      rejectionReason: payment.getRejectionReason(),
      allocation: allocation,
    };

    return output;
  }

  private async getPublicUrl(path?: string): Promise<string> {
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
