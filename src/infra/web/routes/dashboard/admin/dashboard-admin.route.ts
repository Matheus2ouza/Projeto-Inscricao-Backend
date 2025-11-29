import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  FindActiveEventsAdminInput,
  FindActiveEventsAdminUsecase,
} from 'src/usecases/web/dashboard/admin/find-active-events.usecase';
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
import { FindActiveEventsAdminResponse } from './dto/find-active-events.dto';
import { FindActiveParticipantsAdminResponse } from './dto/find-active-participants.dto';
import { FindTotalCollectedAdminResponse } from './dto/find-total-collected.dto';
import { FindTotalDebtAdminResponse } from './dto/find-total-debt.dto';
import { GetDashboardAdminResponse } from './dto/get-dashboard.dto';
import { FindActiveEventsAdminPresenter } from './presenter/find-active-events.presenter';
import { FindActiveParticipantsAdminPresenter } from './presenter/find-active-participants.presenter';
import { FindTotalCollectedAdminPresenter } from './presenter/find-total-collected.presenter';
import { FindTotalDebtAdminPresenter } from './presenter/find-total-debt.presenter';
import { GetDashboardAdminPresenter } from './presenter/get-dashboard.presenter';

@Controller('dashboard/admin')
export class DashboardAdminRoute {
  public constructor(
    private readonly findTotalCollectedUsecase: FindTotalCollectedAdminUsecase,
    private readonly findTotalDebtUsecase: FindTotalDebtAdminUsecase,
    private readonly findActiveParticipantsUsecase: FindActiveParticipantsAdminUsecase,
    private readonly findActiveEventsUsecase: FindActiveEventsAdminUsecase,
  ) {}
  @Get()
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCompleteDashboard(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<GetDashboardAdminResponse> {
    const input = {
      regionId: userInfo.regionId,
    };
    const activeEvents = await this.findActiveEventsUsecase.execute(input);
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);

    return GetDashboardAdminPresenter.tohttp({
      activeEvents,
      totalCollected,
      totalDebt,
      activeParticipants,
    });
  }

  @Get('active-events')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getActiveEvents(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindActiveEventsAdminResponse> {
    const input: FindActiveEventsAdminInput = {
      regionId: userInfo.regionId,
    };
    const activeEvents = await this.findActiveEventsUsecase.execute(input);
    return FindActiveEventsAdminPresenter.tohttp(activeEvents);
  }

  @Get('collected')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCollected(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindTotalCollectedAdminResponse> {
    const input: FindTotalCollectedAdminInput = {
      regionId: userInfo.regionId,
    };
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    return FindTotalCollectedAdminPresenter.tohttp(totalCollected);
  }

  @Get('debt')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getDebt(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindTotalDebtAdminResponse> {
    const input: FindTotalDebtAdminInput = {
      regionId: userInfo.regionId,
    };

    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    return FindTotalDebtAdminPresenter.tohttp(totalDebt);
  }

  @Get('active-participants')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getActiveParticipants(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindActiveParticipantsAdminResponse> {
    const input: FindActiveParticipantsAdminInput = {
      regionId: userInfo.regionId,
    };

    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);

    return FindActiveParticipantsAdminPresenter.tohttp(activeParticipants);
  }
}
