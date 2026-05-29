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
import { SyncRecordAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/sync/sync-record-already-exists.usecase.exception';

@Catch(SyncRecordAlreadyExistsUsecaseException)
export class SyncRecordAlreadyExistsUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: SyncRecordAlreadyExistsUsecaseException,
    host: ArgumentsHost,
  ) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const SyncRecordAlreadyExistsUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: SyncRecordAlreadyExistsUsecaseExceptionFilter,
};

