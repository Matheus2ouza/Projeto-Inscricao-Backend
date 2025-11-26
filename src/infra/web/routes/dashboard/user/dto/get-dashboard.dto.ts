import { FindActiveEventsUserResponse } from './find-active-events.dto';
import { FindTotalDebtUserResponse } from './find-total-debt.dto';
import { FindTotalInscriptionsUserResponse } from './find-total-inscriptions.dto';

export type GetDashboardUserResponse = {
  inscriptions: FindTotalInscriptionsUserResponse;
  events: FindActiveEventsUserResponse;
  payments: FindTotalDebtUserResponse;
};
