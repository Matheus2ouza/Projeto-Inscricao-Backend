import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { AuthTokenNotValidServiceException } from 'src/infra/services/exceptions/auth-token-not-valid.service.exception';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';

@Catch(AuthTokenNotValidServiceException)
export class AuthTokenNotValidServiceExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: AuthTokenNotValidServiceException,
    host: ArgumentsHost,
  ) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.FORBIDDEN;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const AuthTokenNotValidServiceExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: AuthTokenNotValidServiceExceptionFilter,
};
