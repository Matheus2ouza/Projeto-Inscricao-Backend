import { GetDashboardAdminResponse } from '../dto/get-dashboard.dto';

export class GetDashboardAdminPresenter {
  static tohttp(output: {
    activeEvents: { countEventsActive: number };
    totalCollected: { totalCollected: number };
    totalDebt: { totalDebt: number };
    activeParticipants: { countParticipants: number };
  }): GetDashboardAdminResponse {
    return {
      activeEvents: output.activeEvents.countEventsActive,
      totalCollected: output.totalCollected.totalCollected,
      totalDebt: output.totalDebt.totalDebt,
      activeParticipants: output.activeParticipants.countParticipants,
    };
  }
}
