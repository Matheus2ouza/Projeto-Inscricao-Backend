import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';

export type FindUsageStorageSupabaseSuperInput = {};

export type FindUsageStorageSupabaseSuperOutput = {
  usage: number;
  percentage: number;
  limit: number;
};

@Injectable()
export class FindUsageStorageSupabaseSuperUsecase
  implements
    Usecase<
      FindUsageStorageSupabaseSuperInput,
      FindUsageStorageSupabaseSuperOutput
    >
{
  constructor(
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: FindUsageStorageSupabaseSuperInput,
  ): Promise<FindUsageStorageSupabaseSuperOutput> {
    const usageData = await this.supabaseStorageService.getStorageUsage();

    const usage = Math.round(
      usageData.reduce(
        (acc, curr) => acc + curr.total_size_mb * 1024 * 1024,
        0,
      ),
    );

    const limit = 50 * 1024 * 1024; // 50MB
    const percentage = Number(((usage / limit) * 100).toFixed(2));

    const output: FindUsageStorageSupabaseSuperOutput = {
      usage,
      limit,
      percentage,
    };

    return output;
  }
}
