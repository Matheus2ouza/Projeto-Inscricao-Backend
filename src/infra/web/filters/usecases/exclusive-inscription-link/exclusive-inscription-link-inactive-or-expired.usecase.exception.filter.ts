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
import { ExclusiveInscriptionLinkInactiveOrExpiredException } from 'src/usecases/web/exceptions/exclusive-inscription-link/exclusive-inscription-link-inactive-or-expired.usecase.exception';

@Catch(ExclusiveInscriptionLinkInactiveOrExpiredException)
export class ExclusiveInscriptionLinkInactiveOrExpiredExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: ExclusiveInscriptionLinkInactiveOrExpiredException,
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

export const ExclusiveInscriptionLinkInactiveOrExpiredExceptionFilterProvider =
  {
    provide: APP_FILTER,
    useClass: ExclusiveInscriptionLinkInactiveOrExpiredExceptionFilter,
  };
