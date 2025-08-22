import { UsecaseException } from "./usecase.exception";

export class LocalityAlreadyExistsUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'LocalityAlreadyExistsUsecaseException';
  }
}