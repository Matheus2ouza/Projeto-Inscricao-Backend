import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  FindActiveEventsUserInput,
  FindActiveEventsUserUsecase,
} from 'src/usecases/web/dashboard/user/find-active-events.usecase';
import {
  FindTotalDebtUserInput,
  FindTotalDebtUserUsecase,
} from 'src/usecases/web/dashboard/user/find-total-debt.usecase';
import {
  FindTotalInscriptionsUserInput,
  FindTotalInscriptionsUserUsecase,
} from 'src/usecases/web/dashboard/user/find-total-inscriptions.usecase';
import { FindActiveEventsUserResponse } from './dto/find-active-events.dto';
import { FindTotalDebtUserResponse } from './dto/find-total-debt.dto';
import { FindTotalInscriptionsUserResponse } from './dto/find-total-inscriptions.dto';
import { FindActiveEventsUserPresenter } from './presenter/find-active-events.presenter';
import { GetDashboardUserPresenter } from './presenter/get-dashboard.presenter';

@Controller('dashboard/user')
export class DashboardUserRoute {
  public constructor(
    private readonly findActiveEventsUserUsecase: FindActiveEventsUserUsecase,
    private readonly findTotalInscriptionsUserUsecase: FindTotalInscriptionsUserUsecase,
    private readonly findTotalDebtUserUsecase: FindTotalDebtUserUsecase,
  ) {}

  @Get()
  public async getCompleteDashboard(
    @UserInfo() userInfo: { userId: string; regionId: string },
  ) {
    const inputEvents: FindActiveEventsUserInput = {
      regionId: userInfo.regionId,
    };
    const activeEvents =
      await this.findActiveEventsUserUsecase.execute(inputEvents);

    const inputInscriptions: FindTotalInscriptionsUserInput = {
      accountId: userInfo.userId,
      regionId: userInfo.regionId,
    };
    const totalInscriptions =
      await this.findTotalInscriptionsUserUsecase.execute(inputInscriptions);

    const inputDebt: FindTotalDebtUserInput = {
      accountId: userInfo.userId,
      regionId: userInfo.regionId,
    };
    const totalDebt = await this.findTotalDebtUserUsecase.execute(inputDebt);

    return GetDashboardUserPresenter.toHttp({
      inscriptions: totalInscriptions,
      events: activeEvents,
      payments: totalDebt,
    });
  }

  @Get('active-events')
  @Roles(RoleTypeHierarchy.USER)
  public async getActiveEvents(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindActiveEventsUserResponse> {
    const input: FindActiveEventsUserInput = {
      regionId: userInfo.regionId,
    };
    const activeEvents = await this.findActiveEventsUserUsecase.execute(input);
    return FindActiveEventsUserPresenter.tohttp(activeEvents);
  }

  @Get('total-inscriptions')
  @Roles(RoleTypeHierarchy.USER)
  public async getTotalInscriptions(
    @UserInfo() userInfo: { userId: string; regionId: string },
  ): Promise<FindTotalInscriptionsUserResponse> {
    const input: FindTotalInscriptionsUserInput = {
      accountId: userInfo.userId,
      regionId: userInfo.regionId,
    };
    const totalInscriptions =
      await this.findTotalInscriptionsUserUsecase.execute(input);
    return totalInscriptions;
  }

  @Get('total-debt')
  @Roles(RoleTypeHierarchy.USER)
  public async getTotalDebt(
    @UserInfo() userInfo: { userId: string; regionId: string },
  ): Promise<FindTotalDebtUserResponse> {
    const input: FindTotalDebtUserInput = {
      accountId: userInfo.userId,
      regionId: userInfo.regionId,
    };
    const totalDebt = await this.findTotalDebtUserUsecase.execute(input);
    return totalDebt;
  }
}
