import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  PaymentCanceledInput,
  PaymentCanceledUseCase,
} from 'src/usecases/web/payments/asaas/PaymentCanceled/paymentCanceled.usecase';
import { PaymentCanceledPresenter } from './PaymentCanceled.presenter';

@Controller('webhooks')
export class PaymentCanceledRoute {
  private readonly logger = new Logger(PaymentCanceledRoute.name);
  constructor(
    private readonly paymentCanceledUseCase: PaymentCanceledUseCase,
  ) {}

  @IsPublic()
  @Post('asaas/canceled')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: any,
    @Headers('asaas-access-token') asaasToken: string,
  ) {
    // Validar token
    if (asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      this.logger.warn('❌ Tentativa de acesso com token inválido');
      throw new UnauthorizedException('Token de webhook inválido');
    }

    this.logger.log(`📨 Webhook recebido: ${body.event}`);
    this.logger.debug(`Payload: ${JSON.stringify(body, null, 2)}`);

    if (
      body.event === 'CHECKOUT_EXPIRED' ||
      body.event === 'CHECKOUT_CANCELED'
    ) {
      const input: PaymentCanceledInput = {
        checkoutSession:
          body.payment?.id ||
          body.payment?.checkoutSession ||
          body.checkout?.id,
        externalReference:
          body.payment?.externalReference || body.checkout?.externalReference,
      };

      const response = await this.paymentCanceledUseCase.execute(input);

      this.logger.log(
        `✅ Pagamento ${input.checkoutSession} cancelado! Status: ${response.status}`,
      );

      return PaymentCanceledPresenter.toHttp(response);
    }
  }
}
