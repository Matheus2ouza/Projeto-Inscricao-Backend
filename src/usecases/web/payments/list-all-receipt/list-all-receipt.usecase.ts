import { Injectable } from '@nestjs/common';
import { PaymentMethod, StatusPayment } from 'generated/prisma';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type ListAllReceiptInput = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type ListAllReceiptOutput = {
  receipts: Receipt[];
  total: number;
  page: number;
  pageCount: number;
};

export type ReceiptSummary = {
  totalPayments: number;
  totalPaidValue: number;
  totalUnderReviewValue: number;
  totalRefusedValue: number;
};

type Receipt = {
  id: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  imageUrls: string[];
};

@Injectable()
export class ListAllReceiptUsecase
  implements Usecase<ListAllReceiptInput, ListAllReceiptOutput>
{
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(input: ListAllReceiptInput): Promise<ListAllReceiptOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 20)),
    );

    const filters = {
      status: [StatusPayment.APPROVED],
      methodPayment: [PaymentMethod.PIX],
    };

    const [receiptsArray, total] = await Promise.all([
      this.paymentGateway.findAllPaginated(
        input.eventId,
        safePage,
        safePageSize,
        filters,
      ),
      this.paymentGateway.countAllFiltered(input.eventId, filters),
    ]);

    const receipts = await Promise.all(
      receiptsArray.map(async (receipt) => {
        const imageUrls = await this.getPublicUrlsOrEmpty(
          receipt.getImageUrls(),
        );
        return {
          id: receipt.getId(),
          status: receipt.getStatus(),
          totalValue: receipt.getTotalValue(),
          createdAt: receipt.getCreatedAt(),
          imageUrls: imageUrls,
        };
      }),
    );

    const output: ListAllReceiptOutput = {
      receipts,
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }

  private async getPublicUrlsOrEmpty(paths: string[]): Promise<string[]> {
    if (!paths || paths.length === 0) {
      return [];
    }

    try {
      const publicUrls = await Promise.all(
        paths.map(async (path) => {
          try {
            return await this.supabaseStorageService.getPublicUrl(path);
          } catch {
            return '';
          }
        }),
      );
      return publicUrls.filter((url) => url !== '');
    } catch {
      return [];
    }
  }
}
