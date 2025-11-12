import { Exception } from 'src/shared/exceptions/exception';

export class UsecaseException extends Exception {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'UsecaseException';
  }
}
