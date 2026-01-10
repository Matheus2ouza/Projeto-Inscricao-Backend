import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

@Catch(EventNotFoundUsecaseException)
export class EventNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  catch(exception: EventNotFoundUsecaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.CONFLICT;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const MemberAlreadyInscribedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: EventNotFoundUsecaseExceptionFilter,
};
