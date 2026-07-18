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
import { InscriptionModeNotValidUsecaseException } from 'src/usecases/web/exceptions/events/inscription-mode-not-valid.usecase.exception';

@Catch(InscriptionModeNotValidUsecaseException)
export class InscriptionModeNotValidUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: InscriptionModeNotValidUsecaseException,
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
export const InscriptionModeNotValidUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: InscriptionModeNotValidUsecaseExceptionFilter,
};
