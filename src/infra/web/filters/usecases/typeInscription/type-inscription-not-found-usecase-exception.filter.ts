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
import { TypeInscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';

@Catch(TypeInscriptionNotFoundUsecaseException)
export class TypeInscriptionNotFoundUsecaseExceptionFilter
  implements ExceptionFilter
{
  public catch(
    exception: TypeInscriptionNotFoundUsecaseException,
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

export const TypeInscriptionNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: TypeInscriptionNotFoundUsecaseExceptionFilter,
};
