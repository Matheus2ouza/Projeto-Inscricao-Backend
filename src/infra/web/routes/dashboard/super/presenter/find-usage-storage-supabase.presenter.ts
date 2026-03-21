import { FindUsageStorageSupabaseSuperOutput } from 'src/usecases/web/dashboard/super/find-usage-storage-supabase.usecase';
import { FindUsageStorageSupabaseSuperResponse } from '../dto/find-usage-storage-supabase.dto';

export class FindUsageStorageSupabaseSuperPresenter {
  public static toHttp(
    output: FindUsageStorageSupabaseSuperOutput,
  ): FindUsageStorageSupabaseSuperResponse {
    return {
      usage: output.usage,
      limit: output.limit,
      percentage: output.percentage,
    };
  }
}
