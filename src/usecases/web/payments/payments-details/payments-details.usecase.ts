import { Injectable } from '@nestjs/common';
import { PaymentMethod, StatusPayment } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type PaymentsDetailsInput = {
  paymentId: string;
};

export type PaymentsDetailsOutput = {
  id: string;
  status: StatusPayment;
  isGuest: boolean;
  responsible: string;
  methodPayment: PaymentMethod;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string;
  rejectionReason?: string;
  allocations?: PaymentAllocation[];
  installments?: PaymentInstallment[];
};

type PaymentInstallment = {
  installmentNumber: number;
  value: number;
  netValue: number;
  paidAt?: Date;
  createdAt: Date;
};

type PaymentAllocation = {
  value: number;
  inscriptionId: string;
  responsible?: string;
};

@Injectable()
export class PaymentsDetailsUsecase
  implements Usecase<PaymentsDetailsInput, PaymentsDetailsOutput>
{
  public constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly accountGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(input: PaymentsDetailsInput): Promise<PaymentsDetailsOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);
    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `attempt to analysis payment pending details for payment: ${input.paymentId} but it was not found`,
        'Pagamento não encontrado',
        PaymentsDetailsUsecase.name,
      );
    }

    const imagePath = await this.getPublicUrl(payment.getImageUrl());

    // Pegando as alocações do pagamento
    const paymentAllocation =
      await this.paymentAllocationGateway.findByPaymentId(payment.getId());

    // Mapeando alocações e buscando responsável da inscrição
    const allocations = await Promise.all(
      (paymentAllocation || []).map(async (a) => {
        // Assim como no payment, a inscrição também pode ser Guest, se for,
        // então o nome do responsavel esta direto na inscrição, se não,
        // então o responsável é o usuário associado à conta
        const inscription = await this.inscriptionGateway.findById(
          a.getInscriptionId(),
        );

        let responsible = 'Responsável não encontrado';

        if (inscription) {
          if (inscription.getIsGuest()) {
            responsible =
              inscription.getGuestName() || 'Responsável não encontrado';
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

    // Pegando as parcelas do pagamento
    const paymentInstallment =
      await this.paymentInstallmentGateway.findByPaymentId(payment.getId());

    // Mapeando parcelas do pagamento
    const installments = await Promise.all(
      paymentInstallment?.map(async (i) => {
        return {
          installmentNumber: i.getInstallmentNumber(),
          value: i.getValue(),
          netValue: i.getNetValue(),
          paidAt: i.getPaidAt(),
          createdAt: i.getCreatedAt(),
        };
      }),
    );

    // Definindo o responsável pelo pagamento (Payer)
    let responsible = 'Usuário não encontrado';

    // Se for Guest, então pega o nome do responsavel direto do pagamento
    if (payment.getIsGuest()) {
      responsible = payment.getGuestName() || 'Usuário não encontrado';
    }

    // Se não for Guest, então busca o nome do responsavel pela conta associada
    if (!payment.getIsGuest()) {
      const accountId = payment.getAccountId();
      if (accountId) {
        const account = await this.accountGateway.findById(accountId);
        responsible = account?.getUsername() || 'Usuário não encontrado';
      }
    }

    const output: PaymentsDetailsOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
      isGuest: payment.getIsGuest() || false,
      responsible,
      methodPayment: payment.getMethodPayment(),
      totalValue: payment.getTotalValue(),
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
      imageUrl: imagePath,
      rejectionReason: payment.getRejectionReason(),
      allocations,
      installments,
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
