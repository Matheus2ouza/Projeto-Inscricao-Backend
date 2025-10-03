import { ServiceException } from './service.exception';

export class AuthTokenNotValidServiceException extends ServiceException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = AuthTokenNotValidServiceException.name;
  }
}
