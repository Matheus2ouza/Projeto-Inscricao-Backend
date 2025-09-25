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
import { UserAlreadyExistsUsecaseException } from 'src/usecases/exceptions/user-already-exists.usecase.exception';

@Catch(UserAlreadyExistsUsecaseException)
export class UserAlreadyExistsUsecaseExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: UserAlreadyExistsUsecaseException,
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

export const UserAlreadyExistsUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: UserAlreadyExistsUsecaseExceptionFilter,
};
