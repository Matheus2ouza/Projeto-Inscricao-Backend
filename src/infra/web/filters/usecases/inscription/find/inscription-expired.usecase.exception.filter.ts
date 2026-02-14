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
import { InscriptionExpiredUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-expired.usecase.exception';

@Catch(InscriptionExpiredUsecaseException)
export class InscriptionExpiredUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: InscriptionExpiredUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.GONE;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const InscriptionExpiredUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: InscriptionExpiredUsecaseExceptionFilter,
};
