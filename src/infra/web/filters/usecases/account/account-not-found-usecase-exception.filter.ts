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
import { AccountNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/account-not-found.usecase.exception';

@Catch(AccountNotFoundUsecaseException)
export class AccountNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  public catch(
    exception: AccountNotFoundUsecaseException,
    host: ArgumentsHost,
  ) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.NOT_FOUND;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const AccountNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: AccountNotFoundUsecaseExceptionFilter,
};
