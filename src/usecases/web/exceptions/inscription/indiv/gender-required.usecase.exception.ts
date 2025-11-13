import { Exception } from 'src/shared/exceptions/exception';

export class GenderRequiredUsecaseException extends Exception {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'GenderRequiredUsecaseException';
  }
}
