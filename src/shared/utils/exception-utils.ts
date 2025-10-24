import { Exception } from '../exceptions/exception';

export type ExceptionResponde = {
  statusCode: number;
  timeStamp: string;
  message: string;
};

export class ExceptionUtils {
  public static buildErrorResponse(exception: Exception, statusCode: number) {
    const aRespondeData: ExceptionResponde = {
      statusCode: statusCode,
      timeStamp: new Date().toISOString(),
      message: exception.getExternalMessage(),
    };

    return aRespondeData;
  }
}
