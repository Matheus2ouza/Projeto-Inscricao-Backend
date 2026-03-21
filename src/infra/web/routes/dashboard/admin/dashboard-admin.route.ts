import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  FindActiveParticipantsAdminInput,
  FindActiveParticipantsAdminUsecase,
} from 'src/usecases/web/dashboard/admin/find-active-participants.usecase';
import {
  FindTotalCollectedAdminInput,
  FindTotalCollectedAdminUsecase,
} from 'src/usecases/web/dashboard/admin/find-total-collected.usecase';
import {
  FindTotalDebtAdminInput,
  FindTotalDebtAdminUsecase,
} from 'src/usecases/web/dashboard/admin/find-total-debt.usecase';
import {
  FindTotalExpenseInput,
  FindTotalExpenseUsecase,
} from 'src/usecases/web/dashboard/admin/find-total-expense.usecase';
import { FindActiveParticipantsResponse } from './dto/find-active-participants.dto';
import { FindTotalCollectedResponse } from './dto/find-total-collected.dto';
import { FindTotalDebtResponse } from './dto/find-total-debt.dto';
import { FindTotalExpenseResponse } from './dto/find-total-expense.dto';
import { GetDashboardResponse } from './dto/get-dashboard.dto';
import { FindActiveParticipantsAdminPresenter } from './presenter/find-active-participants.presenter';
import { FindTotalCollectedAdminPresenter } from './presenter/find-total-collected.presenter';
import { FindTotalDebtAdminPresenter } from './presenter/find-total-debt.presenter';
import { FindTotalExpenseAdminPresenter } from './presenter/find-total-expense.presenter';
import { GetDashboardAdminPresenter } from './presenter/get-dashboard.presenter';

@Controller('dashboard/admin')
export class DashboardAdminRoute {
  public constructor(
    private readonly findTotalCollectedUsecase: FindTotalCollectedAdminUsecase,
    private readonly findTotalDebtUsecase: FindTotalDebtAdminUsecase,
    private readonly findActiveParticipantsUsecase: FindActiveParticipantsAdminUsecase,
    private readonly findTotalExpenseUsecase: FindTotalExpenseUsecase,
  ) {}
  @Get()
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCompleteDashboard(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<GetDashboardResponse> {
    const input = {
      regionId: userInfo.regionId,
      eventId,
    };
    const totalExpense = await this.findTotalExpenseUsecase.execute(input);
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);

    return GetDashboardAdminPresenter.tohttp({
      totalExpense,
      totalCollected,
      totalDebt,
      activeParticipants,
    });
  }

  // Busca o total de gastos
  @Get('expenses')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getExpenses(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindTotalExpenseResponse> {
    const input: FindTotalExpenseInput = {
      regionId: userInfo.regionId,
      eventId,
    };
    const totalExpense = await this.findTotalExpenseUsecase.execute(input);
    return FindTotalExpenseAdminPresenter.tohttp(totalExpense);
  }

  // Busca o valor total coletado
  @Get('collected')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCollected(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindTotalCollectedResponse> {
    const input: FindTotalCollectedAdminInput = {
      regionId: userInfo.regionId,
      eventId,
    };
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    return FindTotalCollectedAdminPresenter.tohttp(totalCollected);
  }

  // Busca o valor total de dívidas
  @Get('debt')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getDebt(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindTotalDebtResponse> {
    const input: FindTotalDebtAdminInput = {
      regionId: userInfo.regionId,
      eventId,
    };

    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    return FindTotalDebtAdminPresenter.tohttp(totalDebt);
  }

  // Busca o número total de participantes
  @Get('active-participants')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getActiveParticipants(
    @UserInfo() userInfo: { regionId: string },
    @Query('eventId') eventId?: string,
  ): Promise<FindActiveParticipantsResponse> {
    const input: FindActiveParticipantsAdminInput = {
      regionId: userInfo.regionId,
      eventId,
    };

    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);

    return FindActiveParticipantsAdminPresenter.tohttp(activeParticipants);
  }
}
