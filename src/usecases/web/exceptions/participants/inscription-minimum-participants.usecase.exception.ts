import { UsecaseException } from '../usecase.exception';

export class InscriptionMinimumParticipantsUsecaseException extends UsecaseException {
  constructor(
    technicalMessage: string,
    userFriendlyMessage: string = 'A inscrição deve possuir pelo menos um participante.',
    context = 'DeleteParticipantsUsecase',
  ) {
    super(technicalMessage, userFriendlyMessage, context);
    this.name = 'InscriptionMinimumParticipantsUsecaseException';
  }
}
