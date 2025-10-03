import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class RoleGuardExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Acesso negado por role.',
      error: 'Forbidden',
    });
  }
}
