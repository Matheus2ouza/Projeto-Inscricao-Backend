import { FindActiveEventsUserResponse } from '../dto/find-active-events.dto';
import { FindTotalDebtUserResponse } from '../dto/find-total-debt.dto';
import { FindTotalInscriptionsUserResponse } from '../dto/find-total-inscriptions.dto';
import { GetDashboardUserResponse } from '../dto/get-dashboard.dto';

export class GetDashboardUserPresenter {
  public static toHttp(output: {
    inscriptions: FindTotalInscriptionsUserResponse;
    events: FindActiveEventsUserResponse;
    payments: FindTotalDebtUserResponse;
  }): GetDashboardUserResponse {
    return {
      inscriptions: output.inscriptions,
      events: output.events,
      payments: output.payments,
    };
  }
}
