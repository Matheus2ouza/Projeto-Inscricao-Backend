import { GetDashboardAdminResponse } from '../dto/get-dashboard.dto';

export class GetDashboardAdminPresenter {
  static tohttp(output: {
    totalExpense: { totalExpense: number };
    totalCollected: { totalCollected: number };
    totalDebt: { totalDebt: number };
    activeParticipants: { countParticipants: number };
  }): GetDashboardAdminResponse {
    return {
      totalExpense: output.totalExpense.totalExpense,
      totalCollected: output.totalCollected.totalCollected,
      totalDebt: output.totalDebt.totalDebt,
      activeParticipants: output.activeParticipants.countParticipants,
    };
  }
}
