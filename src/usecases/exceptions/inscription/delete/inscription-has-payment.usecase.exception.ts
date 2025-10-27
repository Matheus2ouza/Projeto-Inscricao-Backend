import { UsecaseException } from '../../usecase.exception';

export class InscriptionHasPaymentUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'InscriptionHasPaymentUsecaseException';
  }
}
