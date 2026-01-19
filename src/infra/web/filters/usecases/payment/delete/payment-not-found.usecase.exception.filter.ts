import { ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { PaymentNotFoundUsecaseException } from 'src/usecases/web/exceptions/payment/payment-not-found.usecase.exception';

export class PaymentNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  catch(exception: PaymentNotFoundUsecaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.NOT_FOUND;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const PaymentNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: PaymentNotFoundUsecaseExceptionFilter,
};
