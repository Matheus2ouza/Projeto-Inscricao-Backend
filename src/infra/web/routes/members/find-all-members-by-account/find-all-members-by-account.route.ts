import { Controller, Get, Param } from '@nestjs/common';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllMembersByAccountUsecase,
  FindAllMembersByAccountUsecaseInput,
} from 'src/usecases/web/members/find-all-members-by-account/find-all-members-by-account.usecase';
import type {
  FindAllMembersByAccountUsecaseRequest,
  FindAllMembersByAccountUsecaseResponse,
} from './find-all-members-by-account.dto';
import { FindAllMembersByAccountPresenter } from './find-all-members-by-account.presenter';

@Controller('members')
export class FindAllMembersByAccountRoute {
  constructor(
    private readonly findAllMembersByAccountUsecase: FindAllMembersByAccountUsecase,
  ) {}

  @Get(':eventId/all/names')
  async handle(
    @Param() param: FindAllMembersByAccountUsecaseRequest,
    @UserInfo() user: FindAllMembersByAccountUsecaseRequest,
  ): Promise<FindAllMembersByAccountUsecaseResponse> {
    const input: FindAllMembersByAccountUsecaseInput = {
      eventId: param.eventId,
      accountId: user.userId,
    };

    const response = await this.findAllMembersByAccountUsecase.execute(input);
    return FindAllMembersByAccountPresenter.toHttp(response);
  }
}
