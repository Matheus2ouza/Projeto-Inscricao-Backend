import { UsecaseException } from '../usecase.exception';

export type IncompleteMember = {
  accountParticipantId: string;
  missingFields: string[];
};

export class MissingRequiredParticipantFieldsForGroupUsecaseException extends UsecaseException {
  public readonly incompleteMembers: IncompleteMember[];

  public constructor(
    internalMessage: string,
    publicMessage: string,
    context: string,
    incompleteMembers: IncompleteMember[],
  ) {
    super(internalMessage, publicMessage, context);
    this.name = MissingRequiredParticipantFieldsForGroupUsecaseException.name;
    this.incompleteMembers = incompleteMembers;
  }
}
