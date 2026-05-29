import { UsecaseException } from '../usecase.exception';

export class SyncRecordAlreadyExistsUsecaseException extends UsecaseException {
  constructor(
    internalMessage: string,
    publicMessage: string = 'Registro ja sincronizado.',
    context = 'SyncUsecase',
  ) {
    super(internalMessage, publicMessage, context);
    this.name = 'SyncRecordAlreadyExistsUsecaseException';
  }
}

