import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../../exceptions/events/event-not-found.usecase.exception';

export type FindAccountsToCheckInInput = {
  eventId: string;
  accountId?: string;
  withDebt?: boolean;
  page: number;
  pageSize: number;
};

export type FindAccountsToCheckInOutput = {
  event: Event;
  total: number;
  page: number;
  pageCount: number;
};

type Event = {
  id: string;
  name: string;
  imageUrl: string;
  countAccounts: number;
  amountCollected: number;
  totalDebt: number;
  account: Accounts;
};

type Accounts = {
  id: string;
  username: string;
  status: string;
  countDebt: number;
  countPay: number;
  countInscriptions: number;
}[];

@Injectable()
export class FindAccountsToCheckInUsecase
  implements Usecase<FindAccountsToCheckInInput, FindAccountsToCheckInOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly accountGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAccountsToCheckInInput,
  ): Promise<FindAccountsToCheckInOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(25, Math.floor(input.pageSize || 5)),
    );

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${FindAccountsToCheckInUsecase.name}`,
        `Evento não encontrado`,
        FindAccountsToCheckInUsecase.name,
      );
    }

    const image = await this.getPublicUrlOrEmpty(event.getImageUrl());

    const totalDebt = await this.inscriptionGateway.contTotalDebtByEvent(
      event.getId(),
    );

    const onlyDebtors = Boolean(input.withDebt);

    const [accounts, total] = await Promise.all([
      this.accountGateway.findByEventIdWithPagination(
        safePage,
        safePageSize,
        event.getId(),
        input.accountId,
        onlyDebtors,
      ),

      this.accountGateway.countAllFiltered(
        event.getId(),
        input.accountId,
        onlyDebtors,
      ),
    ]);

    const accountData = await Promise.all(
      accounts.map(async (a) => {
        const countDebt = await this.inscriptionGateway.countTotalDebt(
          event.getId(),
          a.getId(),
        );

        const countInscriptions =
          await this.inscriptionGateway.countTotalInscriptions(
            event.getId(),
            a.getId(),
          );

        return {
          id: a.getId(),
          username: a.getUsername(),
          status: countDebt > 0 ? 'PENDENTE' : 'PAGO',
          countDebt,
          countPay: 0,
          countInscriptions,
        };
      }),
    );

    const output: FindAccountsToCheckInOutput = {
      event: {
        id: event.getId(),
        name: event.getName(),
        imageUrl: image,
        countAccounts: total,
        amountCollected: event.getAmountCollected(),
        totalDebt,
        account: accountData,
      },
      total,
      page: safePage,
      pageCount: Math.ceil(total / safePageSize),
    };

    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }
}
