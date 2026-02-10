import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/payment/invalid-image-format.usecase.exception';

@Catch(InvalidImageFormatUsecaseException)
export class InvalidImageFormatUsecaseExceptionFilter
  implements ExceptionFilter
{
  catch(exception: InvalidImageFormatUsecaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;
    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}
export const InvalidImageFormatUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: InvalidImageFormatUsecaseExceptionFilter,
};
