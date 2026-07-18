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
import { MissingRequiredParticipantFieldsUsecaseException } from 'src/usecases/web/exceptions/participants/missing-required-participant-fields.usecase.exception';

@Catch(MissingRequiredParticipantFieldsUsecaseException)
export class MissingRequiredParticipantFieldsUsecaseExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: MissingRequiredParticipantFieldsUsecaseException,
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

export const MissingRequiredParticipantFieldsUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: MissingRequiredParticipantFieldsUsecaseExceptionFilter,
};
