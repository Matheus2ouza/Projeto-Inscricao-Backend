import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  CreateMembersInput,
  CreateMembersUsecase,
} from 'src/usecases/web/members/create/create-membrers.usecase';
import type {
  CreateMembersRequest,
  CreateMembersResponse,
} from './create-membrers.dto';
import { CreateMembersPresenter } from './create-membrers.presenter';

@Controller('members')
export class CreateMembersRoute {
  public constructor(
    private readonly createMembersUsecase: CreateMembersUsecase,
  ) {}

  @Post('create')
  public async handle(
    @Body() body: CreateMembersRequest,
    @UserId() userId: string,
  ): Promise<CreateMembersResponse> {
    const input: CreateMembersInput = {
      accountId: userId,
      name: body.name,
      birthDate: body.birthDate,
      gender: body.gender,
    };

    const response = await this.createMembersUsecase.execute(input);
    return CreateMembersPresenter.toResponse(response);
  }
}
