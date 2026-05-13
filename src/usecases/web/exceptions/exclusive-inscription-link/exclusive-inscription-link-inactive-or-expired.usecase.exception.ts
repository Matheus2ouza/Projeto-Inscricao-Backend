import { UsecaseException } from '../usecase.exception';

export class ExclusiveInscriptionLinkInactiveOrExpiredException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'ExclusiveInscriptionLinkInactiveOrExpiredException';
  }
}
