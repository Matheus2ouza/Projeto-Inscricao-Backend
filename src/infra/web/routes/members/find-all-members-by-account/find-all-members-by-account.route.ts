import { Controller, Get } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  FindAllMembersByAccountUsecase,
  FindAllMembersByAccountUsecaseInput,
} from 'src/usecases/web/members/find-all-members-by-account/find-all-members-by-account.usecase';
import type { FindAllMembersByAccountUsecaseResponse } from './find-all-members-by-account.dto';
import { FindAllMembersByAccountPresenter } from './find-all-members-by-account.presenter';

@Controller('members')
export class FindAllMembersByAccountRoute {
  constructor(
    private readonly findAllMembersByAccountUsecase: FindAllMembersByAccountUsecase,
  ) {}

  @Get('all/names')
  async handle(
    @UserId() userId: string,
  ): Promise<FindAllMembersByAccountUsecaseResponse> {
    const input: FindAllMembersByAccountUsecaseInput = {
      accountId: userId,
    };

    const response = await this.findAllMembersByAccountUsecase.execute(input);
    return FindAllMembersByAccountPresenter.toHttp(response);
  }
}
