import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';
import { PaymentModeNotAllowedUsecaseException } from 'src/usecases/web/exceptions/events/payment-mode-not-allowed.usecase.exception';

@Catch(PaymentModeNotAllowedUsecaseException)
export class PaymentModeNotAllowedUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: PaymentModeNotAllowedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const PaymentModeNotAllowedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: PaymentModeNotAllowedUsecaseExceptionFilter,
};
