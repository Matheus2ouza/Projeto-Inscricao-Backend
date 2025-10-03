import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ServiceException } from 'src/infra/services/exceptions/service.exception';
import { AuthTokenNotValidServiceException } from 'src/infra/services/exceptions/auth-token-not-valid.service.exception';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';

@Catch(ServiceException)
export class ServiceExceptionFilter implements ExceptionFilter {
  public catch(exception: ServiceException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Se for AuthTokenNotValidServiceException, retorna 403
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof AuthTokenNotValidServiceException) {
      status = HttpStatus.FORBIDDEN;
    }

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const ServiceExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ServiceExceptionFilter,
};
