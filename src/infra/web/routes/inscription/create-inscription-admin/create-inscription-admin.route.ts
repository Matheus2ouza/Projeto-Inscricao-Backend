import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  CreateInscriptionAdminInput,
  CreateInscriptionAdminUsecase,
} from 'src/usecases/web/inscription/create-inscription-admin/create-inscription-admin.usecase';
import {
  type CreateInscriptionAdminRequest,
  CreateInscriptionAdminResponse,
} from './create-inscription-admin.dto';
import { CreateInscriptionAdminPresenter } from './create-inscription-admin.presenter';

@Controller('inscription')
export class CreateInscriptionAdminRoute {
  constructor(
    private readonly createInscriptionAdminUsecase: CreateInscriptionAdminUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.MANAGER)
  @Post('admin')
  async handle(
    @Body() body: CreateInscriptionAdminRequest,
  ): Promise<CreateInscriptionAdminResponse> {
    const input: CreateInscriptionAdminInput = {
      eventId: body.eventId,
      isGuest: body.isGuest,
      accountId: body.accountId,
      responsible: body.responsible,
      email: body.email,
      phone: body.phone,
      locality: body.locality,
      participants: body.participants,
    };

    const response = await this.createInscriptionAdminUsecase.execute(input);
    return CreateInscriptionAdminPresenter.toHttp(response);
  }
}
