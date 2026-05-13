import { Controller, Param, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RegisterPaymentPixAssasInput,
  RegisterPaymentPixAssasUsescase,
} from 'src/usecases/web/payments/register-pix-assas/register-payment-pix-assas.usecase';
import {
  RegisterPaymentPixAssasParams,
  RegisterPaymentPixAssasResponse,
} from './register-pix-assas.dto';
import { RegisterPaymentPixAssasPresenter } from './register-pix-assas.presenter';

@Controller('payments')
export class RegisterPaymentPixAssasRoute {
  constructor(
    private readonly registerPaymentPixAssasUsescase: RegisterPaymentPixAssasUsescase,
  ) {}

  @IsPublic()
  @Post(':inscriptionId/register/pix/assas')
  async handle(
    @Param() params: RegisterPaymentPixAssasParams,
  ): Promise<RegisterPaymentPixAssasResponse> {
    const input: RegisterPaymentPixAssasInput = {
      inscriptionId: params.inscriptionId,
    };

    const response = await this.registerPaymentPixAssasUsescase.execute(input);
    return RegisterPaymentPixAssasPresenter.toHttp(response);
  }
}
