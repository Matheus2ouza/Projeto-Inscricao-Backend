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
  PaymentReceivedInput,
  PaymentReceivedUsecase,
} from 'src/usecases/web/payments/asaas/payment-received/payment-received.usecase';
import type { PaymentReceivedRequest } from './payment-received.dto';
import { PaymentReceivedPresenter } from './payment-received.presenter';

@Controller('webhooks')
export class PaymentReceivedRoute {
  private readonly logger = new Logger(PaymentReceivedRoute.name);

  constructor(
    private readonly paymentReceivedUsecase: PaymentReceivedUsecase,
  ) {}

  @IsPublic()
  @Post('asaas/received')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: PaymentReceivedRequest,
    @Headers('asaas-access-token') asaasToken: string,
  ) {
    // Validar token
    if (asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      this.logger.warn('❌ Tentativa de acesso com token inválido');
      throw new UnauthorizedException('Token de webhook inválido');
    }

    // this.logger.log(`📨 Webhook recebido: ${body.event}`);
    this.logger.log(`📨 Webhook recebido: ${body.event}`);
    this.logger.debug(`Payload: ${JSON.stringify(body, null, 2)}`);

    if (body.event === 'PAYMENT_RECEIVED') {
      const input: PaymentReceivedInput = {
        asaasPaymentId: body.payment.id,
      };

      const response = await this.paymentReceivedUsecase.execute(input);
      this.logger.log(
        `Pagamento ${body.payment.id} recebido! Status: ${response.status}`,
      );
      return PaymentReceivedPresenter.toHttp(response);
    }

    // Retornar resposta para não bloquear outros eventos
    this.logger.log(`Evento ${body.event} recebido mas não processado`);
    return PaymentReceivedPresenter.toHttp({
      status: 'ok',
      message: 'EVENT_RECEIVED',
    });
  }
}
