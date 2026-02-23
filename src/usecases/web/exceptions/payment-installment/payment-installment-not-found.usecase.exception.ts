import { UsecaseException } from '../usecase.exception';

export class PaymentInstallmentNotFoundUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'PaymentInstallmentNotFoundUsecaseException';
  }
}
