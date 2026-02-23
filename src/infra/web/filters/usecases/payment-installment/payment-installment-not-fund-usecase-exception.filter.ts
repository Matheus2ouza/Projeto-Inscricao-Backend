import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { PaymentInstallmentNotFoundUsecaseException } from 'src/usecases/web/exceptions/payment-installment/payment-installment-not-found.usecase.exception';

@Catch(PaymentInstallmentNotFoundUsecaseException)
export class PaymentInstallmentNotFoundUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: PaymentInstallmentNotFoundUsecaseException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.NOT_FOUND;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const PaymentInstallmentNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: PaymentInstallmentNotFoundUsecaseExceptionFilter,
};
