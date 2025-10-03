import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { UserNotAllowedToCreateUserUsecaseException } from 'src/usecases/exceptions/users/user-not-allowed-to-create-user.usecase.exception';

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
    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: HttpStatus.FORBIDDEN,
      message: exception.message,
      timeStamp: new Date().toISOString(),
    });
  }
}

export const UserNotAllowedToCreateUserUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: UserNotAllowedToCreateUserUsecaseExceptionFilter,
};
