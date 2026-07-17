import { Controller, Get, Param } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  UserRole,
  UserRoleType,
} from 'src/infra/web/authenticator/decorators/user-role.decorator';
import {
  FindTypeInscriptionByEventInput,
  FindTypeInscriptionByEventUsecase,
} from 'src/usecases/web/typeInscription/find-type-inscription-by-event/find-type-inscription-by-event.usecase';
import type {
  FindTypeInscriptionByEventRequest,
  FindTypeInscriptionByEventResponse,
} from './find-type-inscription-by-event.dto';
import { FindTypeInscriptionByEventPresenter } from './find-type-inscription-by-event.presenter';

@Controller('type-inscription')
export class FindTypeInscriptionByEvent {
  public constructor(
    private readonly findTypeInscriptionByEventUsecase: FindTypeInscriptionByEventUsecase,
  ) {}

  @IsPublic()
  @Get('event/:eventId')
  public async handle(
    @Param() query: FindTypeInscriptionByEventRequest,
    @UserRole() user: UserRoleType,
  ): Promise<FindTypeInscriptionByEventResponse> {
    const input: FindTypeInscriptionByEventInput = {
      user,
      eventId: query.eventId,
    };

    const response =
      await this.findTypeInscriptionByEventUsecase.execute(input);
    return FindTypeInscriptionByEventPresenter.toHttp(response);
  }
}
