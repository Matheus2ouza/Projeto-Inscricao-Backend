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
  ConfirmPaymentInput,
  ConfirmPaymentUsecase,
} from 'src/usecases/web/payments/asaas/confirm-payment/confirm-payment.usecase';
import type {
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
} from './confirm-payment.dto';
import { ConfirmPaymentPresenter } from './confirm-payment.presenter';

@Controller('webhooks')
export class ConfirmPaymentRoute {
  private readonly logger = new Logger(ConfirmPaymentRoute.name);

  constructor(private readonly confirmPaymentUsecase: ConfirmPaymentUsecase) {}

  @IsPublic()
  @Post('asaas/confirm')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Body() body: ConfirmPaymentRequest,
    @Headers('asaas-access-token') asaasToken: string,
  ): Promise<ConfirmPaymentResponse> {
    // Validar token
    if (asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
      this.logger.warn('❌ Tentativa de acesso com token inválido');
      throw new UnauthorizedException('Token de webhook inválido');
    }

    this.logger.log(`📨 Webhook recebido: ${body.event}`);
    this.logger.debug(`Payload: ${JSON.stringify(body, null, 2)}`);

    // Processar apenas eventos de pagamento confirmado
    if (body.event === 'PAYMENT_CONFIRMED') {
      const input: ConfirmPaymentInput = {
        checkoutSession: body.payment.checkoutSession,
        asaasPaymentId: body.payment.id,
        description: body.payment.description,
        installmentNumber: body.payment.installmentNumber,
        value: body.payment.value,
        netValue: body.payment.netValue,
        confirmedDate: body.payment.confirmedDate,
        estimatedCreditDate: body.payment.estimatedCreditDate,
      };

      const response = await this.confirmPaymentUsecase.execute(input);

      this.logger.log(
        `Pagamento ${body.payment.id} confirmado! Status: ${response.status}`,
      );

      return ConfirmPaymentPresenter.toHttp(response);
    }

    // ✅ IMPORTANTE: Retornar resposta para outros eventos
    this.logger.log(`Evento ${body.event} recebido mas não processado`);
    return ConfirmPaymentPresenter.toEventReceived(body.event);
  }
}
