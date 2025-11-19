import { UsecaseException } from 'src/usecases/web/exceptions/usecase.exception';

export class InscriptionNotPendingStatusUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'InscriptionNotPendingStatusUsecaseException';
  }
}
