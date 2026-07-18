import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateMembersInput,
  CreateMembersUsecase,
} from 'src/usecases/web/members/create/create-membrers.usecase';
import type {
  CreateMembersBody,
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
    @Body() body: CreateMembersBody,
  ): Promise<CreateMembersResponse> {
    const input: CreateMembersInput = {
      localityId: body.localityId,
      name: body.name,
      preferredName: body.preferredName,
      cpf: body.cpf,
      birthDate: body.birthDate,
      gender: body.gender,
      shirtSize: body.shirtSize,
      shirtType: body.shirtType,
    };

    const response = await this.createMembersUsecase.execute(input);
    return CreateMembersPresenter.toResponse(response);
  }
}
