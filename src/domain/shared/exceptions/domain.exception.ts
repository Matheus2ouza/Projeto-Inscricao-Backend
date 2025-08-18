import { Exception } from "src/shared/exceptions/exception"

export class DomainException extends Exception {
  public constructor(
    intetrnalMessage: string,
    externalMessage?: string,
    context?: string
  ) {
    super(intetrnalMessage, externalMessage, context);
    this.name = DomainException.name;
  }
}