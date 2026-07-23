import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { InscriptionStatusEmailHandler } from 'src/infra/services/mail/handlers/inscription/inscription-status-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type UpdateStatusInscriptionInput = {
  inscriptionId: string;
  statusInscription: InscriptionStatus;
};

export type UpdateStatusInscriptionOutput = {
  id: string;
  status: string;
};

@Injectable()
export class UpdateStatusInscriptionUsecase
  implements
    Usecase<UpdateStatusInscriptionInput, UpdateStatusInscriptionOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionStatusEmailHandler: InscriptionStatusEmailHandler,
  ) {}

  async execute({
    inscriptionId,
    statusInscription,
  }: UpdateStatusInscriptionInput): Promise<UpdateStatusInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(inscriptionId);

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to search for registration data for analysis but the registration was not found, id: ${inscriptionId}`,
        `Inscrição não encontrada`,
        UpdateStatusInscriptionUsecase.name,
      );
    }

    inscription.setStatus(statusInscription);
    await this.inscriptionGateway.update(inscription);

    await this.notifyResponsible(inscription);

    const output: UpdateStatusInscriptionOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
    };
    return output;
  }

  private async notifyResponsible(inscription: Inscription) {
    const responsibleEmail = inscription.getEmail();
    if (!responsibleEmail) {
      console.warn(
        `Inscrição ${inscription.getId()} não possui e-mail cadastrado para notificação de status`,
      );
      return;
    }

    const event = await this.eventGateway.findById(inscription.getEventId());

    const emailData = {
      inscriptionId: inscription.getId(),
      eventName: event?.getName() ?? 'Evento',
      eventLocation: event?.getLocation(),
      responsibleName: inscription.getResponsible(),
      responsibleEmail,
      decisionDate: new Date(),
    };

    if (inscription.getStatus() === InscriptionStatus.PENDING) {
      await this.inscriptionStatusEmailHandler.sendApprovedEmail(emailData);
    } else if (inscription.getStatus() === InscriptionStatus.CANCELLED) {
      await this.inscriptionStatusEmailHandler.sendRejectedEmail(emailData);
    }
  }
}
