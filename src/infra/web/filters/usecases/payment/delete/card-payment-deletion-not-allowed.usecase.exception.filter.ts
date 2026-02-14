import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { CardPaymentDeletionNotAllowedUsecaseException } from 'src/usecases/web/exceptions/payment/card-payment-deletion-not-allowed.usecase.exception';

@Catch(CardPaymentDeletionNotAllowedUsecaseException)
export class CardPaymentDeletionNotAllowedUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: CardPaymentDeletionNotAllowedUsecaseException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const CardPaymentDeletionNotAllowedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: CardPaymentDeletionNotAllowedUsecaseExceptionFilter,
};
