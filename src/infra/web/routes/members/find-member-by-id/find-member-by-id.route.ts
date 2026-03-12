import { Controller, Get, Param } from '@nestjs/common';
import {
  FindMemberByIdInput,
  FindMemberByIdUsecase,
} from 'src/usecases/web/members/find-member-by-id/find-member-by-id.usecase';
import {
  type FindMemberByIdRequest,
  FindMemberByIdResponse,
} from './find-member-by-id.dto';
import { FindMemberByIdPresenter } from './find-member-by-id.presenter';

@Controller('members')
export class FindMemberByIdRoute {
  constructor(private readonly findMemberByIdUsecase: FindMemberByIdUsecase) {}

  @Get(':id')
  async handle(
    @Param() params: FindMemberByIdRequest,
  ): Promise<FindMemberByIdResponse> {
    const input: FindMemberByIdInput = {
      id: params.id,
    };

    const response = await this.findMemberByIdUsecase.execute(input);
    return FindMemberByIdPresenter.toHttp(response);
  }
}
