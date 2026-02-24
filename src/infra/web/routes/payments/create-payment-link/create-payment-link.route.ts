import { Controller, Param, Post } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  CreatePaymentLinkInput,
  CreatePaymentLinkUsecase,
} from 'src/usecases/web/payments/create-payment-link/create-payment-link.usecase';
import type {
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
} from './create-payment-link.dto';
import { CreatePaymentLinkPresenter } from './create-payment-link.presenter';

@Controller('payments')
export class CreatePaymentLinkRoute {
  constructor(
    private readonly createPaymentLinkUsecase: CreatePaymentLinkUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.MANAGER)
  @Post(':inscriptionId/link')
  async handler(
    @Param() param: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse> {
    const input: CreatePaymentLinkInput = {
      inscriptionId: param.inscriptionId,
    };

    const response = await this.createPaymentLinkUsecase.execute(input);
    return CreatePaymentLinkPresenter.toHttp(response);
  }
}
