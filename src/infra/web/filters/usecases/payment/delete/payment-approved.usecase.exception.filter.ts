import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { PaymentApprovedUsecaseException } from 'src/usecases/web/exceptions/payment/payment-approved.usecase.exception';

@Catch(PaymentApprovedUsecaseException)
export class PaymentApprovedUsecaseExceptionFilter implements ExceptionFilter {
  catch(exception: PaymentApprovedUsecaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const PaymentApprovedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: PaymentApprovedUsecaseExceptionFilter,
};
