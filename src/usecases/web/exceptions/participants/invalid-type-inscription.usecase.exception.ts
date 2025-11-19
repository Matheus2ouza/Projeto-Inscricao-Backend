import { UsecaseException } from '../usecase.exception';

export class InvalidTypeInscriptionUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'InvalidTypeInscriptionUsecaseException';
  }
}
