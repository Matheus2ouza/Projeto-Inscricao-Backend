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
  PaymentReprovedInput,
  PaymentReprovedUsecase,
} from 'src/usecases/web/payments/asaas/payment-reproved/payment-reproved.usecase';
import { PaymentReprovedPresenter } from './payment-reproved.presenter';

@Controller('webhooks')
export class PaymentReprovedRoute {
  private readonly logger = new Logger(PaymentReprovedRoute.name);
  constructor(
    private readonly paymentReprovedUsecase: PaymentReprovedUsecase,
  ) {}

  @IsPublic()
  @Post('asaas/reproved')
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

    if (body.event === 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED') {
      const input: PaymentReprovedInput = {
        checkoutSession:
          body.payment?.id ||
          body.payment?.checkoutSession ||
          body.checkout?.id,
        externalReference:
          body.payment?.externalReference || body.checkout?.externalReference,
        asaasPaymentId: body.payment?.id,
      };

      const response = await this.paymentReprovedUsecase.execute(input);

      this.logger.log(
        `✅ Pagamento ${input.checkoutSession} reprovado! Status: ${response.status}`,
      );

      return PaymentReprovedPresenter.toHttp(response);
    }
  }
}
