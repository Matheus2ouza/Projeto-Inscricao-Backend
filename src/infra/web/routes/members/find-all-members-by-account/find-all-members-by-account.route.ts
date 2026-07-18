import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  FindAllMembersByAccountUsecase,
  FindAllMembersByAccountUsecaseInput,
} from 'src/usecases/web/members/find-all-members-by-account/find-all-members-by-account.usecase';
import type {
  FindAllMembersByAccountUsecaseParam,
  FindAllMembersByAccountUsecaseQuery,
  FindAllMembersByAccountUsecaseResponse,
} from './find-all-members-by-account.dto';
import { FindAllMembersByAccountPresenter } from './find-all-members-by-account.presenter';

@Controller('members')
export class FindAllMembersByAccountRoute {
  constructor(
    private readonly findAllMembersByAccountUsecase: FindAllMembersByAccountUsecase,
  ) {}

  @Get(':eventId/all-names')
  async handle(
    @Param() param: FindAllMembersByAccountUsecaseParam,
    @Query() query: FindAllMembersByAccountUsecaseQuery,
  ): Promise<FindAllMembersByAccountUsecaseResponse> {
    const input: FindAllMembersByAccountUsecaseInput = {
      eventId: param.eventId,
      localityId: query.localityId,
    };

    const response = await this.findAllMembersByAccountUsecase.execute(input);
    return FindAllMembersByAccountPresenter.toHttp(response);
  }
}
