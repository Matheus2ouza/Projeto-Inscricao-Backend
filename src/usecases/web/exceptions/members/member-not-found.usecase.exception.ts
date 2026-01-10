import { UsecaseException } from '../usecase.exception';

export class MemberNotFoundUsecaseException extends UsecaseException {
  constructor(internalMessage: string, publicMessage: string, context: string) {
    super(internalMessage, publicMessage, context);
    this.name = 'MemberNotFoundUsecaseException';
  }
}
