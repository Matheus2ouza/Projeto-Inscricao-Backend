import { Body, Controller, Param, Put } from '@nestjs/common';
import { UpdateMemberUsecase } from 'src/usecases/web/members/update-member/update-member.usecase';
import {
  type UpdateMemberRequest,
  UpdateMemberResponse,
} from './update-member.dto';
import { UpdateMemberPresenter } from './update-member.presenter';

@Controller('members')
export class UpdateMemberRoute {
  constructor(private readonly updateMemberUsecase: UpdateMemberUsecase) {}

  @Put(':id')
  async handle(
    @Param() param: UpdateMemberRequest,
    @Body() body: UpdateMemberRequest,
  ): Promise<UpdateMemberResponse> {
    const input: UpdateMemberRequest = {
      id: param.id,
      name: body.name,
      preferredName: body.preferredName,
      cpf: body.cpf,
      birthDate: body.birthDate,
      gender: body.gender,
      shirtSize: body.shirtSize,
      shirtType: body.shirtType,
    };

    const response = await this.updateMemberUsecase.execute(input);
    return UpdateMemberPresenter.toHttp(response);
  }
}
