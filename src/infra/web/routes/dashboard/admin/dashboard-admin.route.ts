import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  FindActiveEventsInput,
  FindActiveEventsUsecase,
} from 'src/usecases/web/dashboard/admin/find-active-events.usecase';
import {
  FindActiveParticipantsInput,
  FindActiveParticipantsUsecase,
} from 'src/usecases/web/dashboard/admin/find-active-participants.usecase';
import {
  FindTotalCollectedInput,
  FindTotalCollectedUsecase,
} from 'src/usecases/web/dashboard/admin/find-total-collected.usecase';
import {
  FindTotalDebtInput,
  FindTotalDebtUsecase,
} from 'src/usecases/web/dashboard/admin/find-total-debt.usecase';
import { FindActiveEventsResponse } from './dto/find-active-events.dto';
import { FindActiveParticipantsResponse } from './dto/find-active-participants.dto';
import { FindTotalCollectedResponse } from './dto/find-total-collected.dto';
import { FindTotalDebtResponse } from './dto/find-total-debt.dto';
import { GetDashboardAdminResponse } from './dto/get-dashboard.dto';
import { FindActiveEventsPresenter } from './presenter/find-active-events.presenter';
import { FindActiveParticipantsPresenter } from './presenter/find-active-participants.presenter';
import { FindTotalCollectedPresenter } from './presenter/find-total-collected.presenter';
import { FindTotalDebtPresenter } from './presenter/find-total-debt.presenter';
import { GetDashboardAdminPresenter } from './presenter/get-dashboard.presenter';

@Controller('dashboard/admin')
export class DashboardAdminRoute {
  public constructor(
    private readonly findTotalCollectedUsecase: FindTotalCollectedUsecase,
    private readonly findTotalDebtUsecase: FindTotalDebtUsecase,
    private readonly findActiveParticipantsUsecase: FindActiveParticipantsUsecase,
    private readonly findActiveEventsUsecase: FindActiveEventsUsecase,
  ) {}
  @Get()
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCompleteDashboard(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<GetDashboardAdminResponse> {
    console.log('chamou o getCompleteDashboard');
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
  ): Promise<FindActiveEventsResponse> {
    console.log('chamou o getActiveEvents');
    const input: FindActiveEventsInput = {
      regionId: userInfo.regionId,
    };
    const activeEvents = await this.findActiveEventsUsecase.execute(input);
    return FindActiveEventsPresenter.tohttp(activeEvents);
  }

  @Get('collected')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getCollected(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindTotalCollectedResponse> {
    console.log('chamou o getCollected');
    const input: FindTotalCollectedInput = {
      regionId: userInfo.regionId,
    };
    const totalCollected = await this.findTotalCollectedUsecase.execute(input);
    return FindTotalCollectedPresenter.tohttp(totalCollected);
  }

  @Get('debt')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getDebt(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindTotalDebtResponse> {
    console.log('chamou o getDebt');
    const input: FindTotalDebtInput = {
      regionId: userInfo.regionId,
    };

    const totalDebt = await this.findTotalDebtUsecase.execute(input);
    return FindTotalDebtPresenter.tohttp(totalDebt);
  }

  @Get('active-participants')
  @Roles(RoleTypeHierarchy.MANAGER)
  public async getActiveParticipants(
    @UserInfo() userInfo: { regionId: string },
  ): Promise<FindActiveParticipantsResponse> {
    console.log('chamou o getActiveParticipants');
    const input: FindActiveParticipantsInput = {
      regionId: userInfo.regionId,
    };

    const activeParticipants =
      await this.findActiveParticipantsUsecase.execute(input);

    return FindActiveParticipantsPresenter.tohttp(activeParticipants);
  }
}
