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
import { EventExpensesNotFoundUsecaseException } from 'src/usecases/web/exceptions/expense/event-expense-not-found.usecase.exception';

@Catch(EventExpensesNotFoundUsecaseException)
export class EventExpensesNotFoundUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: EventExpensesNotFoundUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.NOT_FOUND;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const EventExpensesNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: EventExpensesNotFoundUsecaseExceptionFilter,
};
