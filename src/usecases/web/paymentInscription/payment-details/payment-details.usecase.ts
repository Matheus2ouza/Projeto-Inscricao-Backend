import { Injectable } from '@nestjs/common';
import { InscriptionStatus, StatusPayment } from 'generated/prisma';
import type { Account } from 'src/domain/entities/account.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { PaymentInscriptionNotFoundUsecaseException } from '../../exceptions/paymentInscription/payment-inscription-not-found.usecase.exception';

export type PaymentDetailsInput = {
  paymentInscriptionId: string;
};

export type PaymentDetailsOutput = {
  inscription: InscriptionDetails;
};

type InscriptionDetails = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  status: InscriptionStatus;
  openBalance: number;
  originalValue: number;
  countParticipants: number;
  payments: PaymentSummary[];
};

type PaymentSummary = {
  id: string;
  accountName?: string;
  status: StatusPayment;
  value: number;
  imageUrl: string;
  approvedBy?: string;
  createdAt: Date;
};

@Injectable()
export class PaymentDetailsUsecase
  implements Usecase<PaymentDetailsInput, PaymentDetailsOutput>
{
  constructor(
    private readonly accountGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: PaymentDetailsInput,
  ): Promise<PaymentDetailsOutput> {
    const paymentInscription = await this.paymentInscriptionGateway.findById(
      input.paymentInscriptionId,
    );

    if (!paymentInscription) {
      throw new PaymentInscriptionNotFoundUsecaseException(
        `Payment Inscription not found with id ${input.paymentInscriptionId}`,
        `Pagamento de inscrição não encontrado`,
        PaymentDetailsUsecase.name,
      );
    }

    // Buscar inscrição
    const inscription = await this.inscriptionGateway.findById(
      paymentInscription.getInscriptionId(),
    );

    if (!inscription) {
      throw new Error('Inscrição não encontrada');
    }

    // Buscar participantes
    const participants = await this.participantGateway.findByInscriptionId(
      inscription.getId(),
    );

    const typeInscription = await this.typeInscriptionGateway.findByEventId(
      inscription.getEventId(),
    );

    const typeMap = new Map(typeInscription.map((t) => [t.getId(), t]));

    const originalValue = participants.reduce((sum, p) => {
      const type = typeMap.get(p.getTypeInscriptionId());
      return sum + Number(type?.getValue() ?? 0);
    }, 0);

    const payments = await this.paymentInscriptionGateway.findbyInscriptionId(
      inscription.getId(),
    );

    const accountIds = new Set<string>();
    payments.forEach((payment) => {
      accountIds.add(payment.getAccountId());
      const approvedBy = payment.getApprovedBy();
      if (approvedBy) {
        accountIds.add(approvedBy);
      }
    });

    const accountsMap = new Map<string, Account | null>();
    for (const accountId of accountIds) {
      const account = await this.accountGateway.findById(accountId);
      accountsMap.set(accountId, account);
    }

    const paymentsOutput = await Promise.all(
      payments.map(async (payment) => {
        const paymentImageUrl = await this.getPublicUrlOrEmpty(
          payment.getImageUrl(),
        );
        const approvedBy = payment.getApprovedBy();
        return {
          id: payment.getId(),
          accountName: accountsMap.get(payment.getAccountId())?.getUsername(),
          status: payment.getStatus(),
          value: Number(payment.getValue()),
          imageUrl: paymentImageUrl,
          approvedBy: approvedBy
            ? accountsMap.get(approvedBy)?.getUsername()
            : undefined,
          createdAt: payment.getCreatedAt(),
        };
      }),
    );

    return {
      inscription: {
        id: inscription.getId(),
        responsible: inscription.getResponsible(),
        email: inscription.getEmail(),
        phone: inscription.getPhone(),
        status: inscription.getStatus(),
        openBalance: inscription.getTotalValue(),
        originalValue,
        countParticipants: participants.length,
        payments: paymentsOutput,
      },
    };
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
