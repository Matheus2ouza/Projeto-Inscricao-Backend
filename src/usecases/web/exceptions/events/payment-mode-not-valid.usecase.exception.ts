import { UsecaseException } from '../usecase.exception';

export class PaymentModeNotValidUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = PaymentModeNotValidUsecaseException.name;
  }
}
