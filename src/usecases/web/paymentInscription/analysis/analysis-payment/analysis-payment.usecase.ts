import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { InvalidInscriptionIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/invalid-inscription-id.usecase.exception ';
import { MissingInscriptionIdUsecaseException } from 'src/usecases/web/exceptions/paymentInscription/missing-inscription-id.usecase.exception';

export type AnalysisPaymentInput = {
  page: number;
  pageSize: number;
  status?: StatusPayment[];
  inscriptionId: string;
};

export type AnalysisPaymentOutput = {
  inscription: Inscription;
  total: number;
  page: number;
  pageCount: number;
};

type Inscription = {
  id: string;
  status: string;
  responsible: string;
  phone: string;
  email?: string;
  totalValue: number;
  payments: Payments;
};

type Payments = {
  id: string;
  status: string;
  value: number;
  image: string | undefined;
}[];

@Injectable()
export class AnalysisPaymentUsecase
  implements Usecase<AnalysisPaymentInput, AnalysisPaymentOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(input: AnalysisPaymentInput): Promise<AnalysisPaymentOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(6, Math.floor(input.pageSize || 10)),
    );

    //Validações das inscrições
    if (!input.inscriptionId) {
      throw new MissingInscriptionIdUsecaseException(
        `attempt to register payment without InscriptionId: ${input.inscriptionId}`,
        `ID da Inscrição não informado`,
        AnalysisPaymentUsecase.name,
      );
    }

    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InvalidInscriptionIdUsecaseException(
        `attempt to register a payment but the inscriptionId does not refer to any inscription: ${input.inscriptionId}`,
        `ID da inscrição é invalido`,
        AnalysisPaymentUsecase.name,
      );
    }

    const [payments, total] = await Promise.all([
      this.paymentInscriptionGateway.findToAnalysis(
        input.inscriptionId,
        safePage,
        safePageSize,
      ),

      this.paymentInscriptionGateway.countAllFiltered({
        inscriptionId: input.inscriptionId,
        status: input.status,
      }),
    ]);

    // Processar os pagamentos para obter as URLs públicas
    const enrichedPayments = await Promise.all(
      payments.map(async (p) => {
        let publicImageUrl: string | undefined = '';
        const imagePath = p.getImageUrl();

        if (imagePath) {
          try {
            publicImageUrl =
              await this.supabaseStorageService.getPublicUrl(imagePath);
          } catch (e) {
            // Se houver erro, mantém a URL original
            publicImageUrl = undefined;
          }
        }

        return {
          id: p.getId(),
          status: p.getStatus(),
          value: Number(p.getValue()),
          image: publicImageUrl,
        };
      }),
    );

    const output: AnalysisPaymentOutput = {
      inscription: {
        id: inscription.getId(),
        status: inscription.getStatus(),
        responsible: inscription.getResponsible(),
        phone: inscription.getPhone(),
        email: inscription.getEmail(),
        totalValue: inscription.getTotalValue(),
        payments: enrichedPayments,
      },
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };
    return output;
  }
}
