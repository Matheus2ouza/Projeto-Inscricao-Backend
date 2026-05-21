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
import { PaymentAllocationExceededUsecaseException } from 'src/usecases/web/exceptions/payment-Inscription/payment-allocation-exceeded.usecase.exception';

@Catch(PaymentAllocationExceededUsecaseException)
export class PaymentAllocationExceededUsecaseExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: PaymentAllocationExceededUsecaseException,
    host: ArgumentsHost,
  ) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const PaymentAllocationExceededUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: PaymentAllocationExceededUsecaseExceptionFilter,
};
