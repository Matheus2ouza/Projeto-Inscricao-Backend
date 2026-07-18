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
import { MissingRequiredParticipantFieldsForGroupUsecaseException } from 'src/usecases/web/exceptions/participants/missing-required-participant-fields-for-group.usecase.exception';

@Catch(MissingRequiredParticipantFieldsForGroupUsecaseException)
export class MissingRequiredParticipantFieldsForGroupUsecaseExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: MissingRequiredParticipantFieldsForGroupUsecaseException,
    host: ArgumentsHost,
  ) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json({
      ...aResponseData,
      incompleteMembers: exception.incompleteMembers,
    });
  }
}

export const MissingRequiredParticipantFieldsForGroupUsecaseExceptionFilterProvider =
  {
    provide: APP_FILTER,
    useClass: MissingRequiredParticipantFieldsForGroupUsecaseExceptionFilter,
  };
