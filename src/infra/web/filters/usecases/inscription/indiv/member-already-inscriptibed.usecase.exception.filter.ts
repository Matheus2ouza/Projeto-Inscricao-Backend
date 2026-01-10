import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { MemberAlreadyInscribedUsecaseException } from 'src/usecases/web/exceptions/members/member-already-inscriptibed.usecase.exception';

@Catch(MemberAlreadyInscribedUsecaseException)
export class MemberAlreadyInscribedUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: MemberAlreadyInscribedUsecaseException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const MemberAlreadyInscribedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: MemberAlreadyInscribedUsecaseExceptionFilter,
};
