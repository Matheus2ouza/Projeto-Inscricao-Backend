import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { UserNotAllowedToCreateUserUsecaseException } from 'src/usecases/web/exceptions/accounts/user-not-allowed-to-create-user.usecase.exception';

@Catch(UserNotAllowedToCreateUserUsecaseException)
export class UserNotAllowedToCreateUserUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: UserNotAllowedToCreateUserUsecaseException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const UserNotAllowedToCreateUserUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: UserNotAllowedToCreateUserUsecaseExceptionFilter,
};
