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
import { UsecaseException } from 'src/usecases/exceptions/usecase.exception';

@Catch(UsecaseException)
export class UsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: UsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const UsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: UsecaseExceptionFilter,
};
