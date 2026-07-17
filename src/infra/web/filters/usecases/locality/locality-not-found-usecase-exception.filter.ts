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
import { LocalityNotFoundUsecaseException } from 'src/usecases/web/exceptions/locality/locality-not-found.usecase.exception';

@Catch(LocalityNotFoundUsecaseException)
export class LocalityNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  catch(exception: LocalityNotFoundUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const LocalityNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: LocalityNotFoundUsecaseExceptionFilter,
};
