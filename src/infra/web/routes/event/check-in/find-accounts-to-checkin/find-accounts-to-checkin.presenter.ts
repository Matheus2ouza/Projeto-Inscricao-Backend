import { FindAccountsToCheckInOutput } from 'src/usecases/web/event/check-in/find-accounts-to-checkin/find-accounts-to-checkin.usecase';
import {
  AccountsPaginatedResponse,
  EventCheckInInfoResponse,
  FindAccountsToCheckInResponse,
} from './find-accounts-to-checkin.dto';

export class FindAccountsToCheckInPresenter {
  // 🔵 Converte tudo para a resposta padrão (rota antiga)
  public static toHttp(
    output: FindAccountsToCheckInOutput,
  ): FindAccountsToCheckInResponse {
    return {
      event: {
        id: output.event.id,
        name: output.event.name,
        imageUrl: output.event.imageUrl,
        countAccounts: output.event.countAccounts,
        amountCollected: output.event.amountCollected,
        totalDebt: output.event.totalDebt,
        account: output.event.account,
      },
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }

  // 🟢 Para rota /check-in (somente info fixa do evento)
  public static toEventInfo(
    output: FindAccountsToCheckInOutput,
  ): EventCheckInInfoResponse {
    return {
      id: output.event.id,
      name: output.event.name,
      imageUrl: output.event.imageUrl,
      countAccounts: output.event.countAccounts,
      amountCollected: output.event.amountCollected,
      totalDebt: output.event.totalDebt,
    };
  }

  // 🟣 Para rota /check-in/accounts (somente contas paginadas)
  public static toAccountsPaginated(
    output: FindAccountsToCheckInOutput,
  ): AccountsPaginatedResponse {
    return {
      accounts: output.event.account,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
