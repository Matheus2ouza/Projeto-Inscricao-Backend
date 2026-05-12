import { Body, Controller, Post } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  CreateExclusiveInscriptionLinkInput,
  CreateExclusiveInscriptionLinkUsecase,
} from 'src/usecases/web/exclusive-inscription-link/create-exclusive-inscription-link/create-exclusive-inscription-link.usecase';
import {
  CreateExclusiveInscriptionLinkBody,
  CreateExclusiveInscriptionLinkResponse,
} from './create-exclusive-inscription-link.dto';
import { CreateExclusiveInscriptionLinkPresenter } from './create-exclusive-inscription-link.presenter';

@Controller('exclusive-inscription')
export class CreateExclusiveInscriptionLinkRoute {
  constructor(
    private readonly createExclusiveInscriptionLinkUsecase: CreateExclusiveInscriptionLinkUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() body: CreateExclusiveInscriptionLinkBody,
    @UserInfo() user: UserInfoType,
  ): Promise<CreateExclusiveInscriptionLinkResponse> {
    const input: CreateExclusiveInscriptionLinkInput = {
      eventId: body.eventId,
      typeInscriptionIds: body.typeInscriptionIds,
      name: body.name,
      createdBy: user.userId,
      expiresAt: body.expiresAt,
    };

    const response =
      await this.createExclusiveInscriptionLinkUsecase.execute(input);
    return CreateExclusiveInscriptionLinkPresenter.toHttp(response);
  }
}
