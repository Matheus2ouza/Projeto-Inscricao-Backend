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
import { ReceiptsNotProvidedUsecaseException } from 'src/usecases/web/exceptions/expense/receipts-not-provided.usecase.exception';

@Catch(ReceiptsNotProvidedUsecaseException)
export class ReceiptsNotProvidedUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: ReceiptsNotProvidedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.NOT_FOUND;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const ReceiptsNotProvidedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ReceiptsNotProvidedUsecaseExceptionFilter,
};
