import { GetDashboardSuperResponse } from '../dto/get-dashboard.dto';

export class GetDashboardSuperPresenter {
  static tohttp(output: {
    totalExpense: { totalExpense: number };
    totalCollected: { totalCollected: number; totalNetValueCollected: number };
    totalDebt: { totalDebt: number };
    activeParticipants: { countParticipants: number };
    usage: { usage: number; percentage: number; limit: number };
  }): GetDashboardSuperResponse {
    return {
      totalExpense: output.totalExpense.totalExpense,
      totalCollected: output.totalCollected.totalCollected,
      totalNetValueCollected: output.totalCollected.totalNetValueCollected,
      totalDebt: output.totalDebt.totalDebt,
      activeParticipants: output.activeParticipants.countParticipants,
      usage: output.usage.usage,
      percentage: output.usage.percentage,
      limit: output.usage.limit,
    };
  }
}
