import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  FindActiveParticipantsSuperInput,
  FindActiveParticipantsSuperUsecase,
} from 'src/usecases/web/dashboard/super/find-active-participants.usecase';
import {
  FindTotalCollectedSuperInput,
  FindTotalCollectedSuperUsecase,
} from 'src/usecases/web/dashboard/super/find-total-collected.usecase';
import {
  FindTotalDebtSuperInput,
  FindTotalDebtSuperUsecase,
} from 'src/usecases/web/dashboard/super/find-total-debt.usecase';
import {
  FindTotalExpenseSuperInput,
  FindTotalExpenseSuperUsecase,
} from 'src/usecases/web/dashboard/super/find-total-expense.usecase';
import { FindUsageStorageSupabaseSuperUsecase } from 'src/usecases/web/dashboard/super/find-usage-storage-supabase.usecase';
import { FindActiveParticipantsSuperResponse } from './dto/find-active-participants.dto';
import { FindTotalCollectedSuperResponse } from './dto/find-total-collected.dto';
import { FindTotalDebtSuperResponse } from './dto/find-total-debt.dto';
import { FindTotalExpenseSuperResponse } from './dto/find-total-expense.dto';
import { FindUsageStorageSupabaseSuperResponse } from './dto/find-usage-storage-supabase.dto';
import { GetDashboardSuperResponse } from './dto/get-dashboard.dto';
import { FindActiveParticipantsSuperPresenter } from './presenter/find-active-participants.presenter';
import { FindTotalCollectedSuperPresenter } from './presenter/find-total-collected.presenter';
import { FindTotalDebtSuperPresenter } from './presenter/find-total-debt.presenter';
import { FindTotalExpenseSuperPresenter } from './presenter/find-total-expense.presenter';
import { FindUsageStorageSupabaseSuperPresenter } from './presenter/find-usage-storage-supabase.presenter';
import { GetDashboardSuperPresenter } from './presenter/get-dashboard.presenter';

@Controller('dashboard/super')
export class DashboardSuperRoute {
  public constructor(
    private readonly findUsageStorageSupabaseUsecase: FindUsageStorageSupabaseSuperUsecase,
    private readonly findTotalExpenseUsecase: FindTotalExpenseSuperUsecase,
    private readonly findTotalCollectedUsecase: FindTotalCollectedSuperUsecase,
    private readonly findTotalDebtUsecase: FindTotalDebtSuperUsecase,
    private readonly findActiveParticipantsUsecase: FindActiveParticipantsSuperUsecase,
  ) {}

  @Get()
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCompleteDashboard(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<GetDashboardSuperResponse> {
    const input = {
      regionId: userInfo.regionId,
      eventId,
    };
    const totalExpense = await this.findTotalExpenseUsecase.execute(input);
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);
    const usage = await this.findUsageStorageSupabaseUsecase.execute({});

    return GetDashboardSuperPresenter.tohttp({
      totalExpense,
      totalCollected,
      totalDebt,
      activeParticipants,
      usage,
    });
  }

  @Get('usage-storage-supabase')
  async getUsageStorageSupabase(): Promise<FindUsageStorageSupabaseSuperResponse> {
    const usage = await this.findUsageStorageSupabaseUsecase.execute({});
    return FindUsageStorageSupabaseSuperPresenter.toHttp(usage);
  }

  // Busca o total de gastos
  @Get('expenses')
  @Roles(RoleTypeHierarchy.SUPER)
  public async getExpenses(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindTotalExpenseSuperResponse> {
    const input: FindTotalExpenseSuperInput = {
      regionId: userInfo.regionId,
      eventId,
    };
    const totalExpense = await this.findTotalExpenseUsecase.execute(input);
    return FindTotalExpenseSuperPresenter.tohttp(totalExpense);
  }

  // Busca o valor total coletado
  @Get('collected')
  @Roles(RoleTypeHierarchy.SUPER)
  public async getCollected(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindTotalCollectedSuperResponse> {
    const input: FindTotalCollectedSuperInput = {
      regionId: userInfo.regionId,
      eventId,
    };
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    return FindTotalCollectedSuperPresenter.tohttp(totalCollected);
  }

  // Busca o valor total de dívidas
  @Get('debt')
  @Roles(RoleTypeHierarchy.SUPER)
  public async getDebt(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindTotalDebtSuperResponse> {
    const input: FindTotalDebtSuperInput = {
      regionId: userInfo.regionId,
      eventId,
    };

    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    return FindTotalDebtSuperPresenter.tohttp(totalDebt);
  }

  // Busca o número total de participantes
  @Get('active-participants')
  @Roles(RoleTypeHierarchy.SUPER)
  public async getActiveParticipants(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindActiveParticipantsSuperResponse> {
    const input: FindActiveParticipantsSuperInput = {
      regionId: userInfo.regionId,
      eventId,
    };

    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);

    return FindActiveParticipantsSuperPresenter.tohttp(activeParticipants);
  }
}
