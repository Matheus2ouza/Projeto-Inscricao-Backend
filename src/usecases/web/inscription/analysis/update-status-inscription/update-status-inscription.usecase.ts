import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionHasPaymentUsecaseException } from 'src/usecases/web/exceptions/inscription/delete/inscription-has-payment.usecase.exception';
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
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
  ) {}

  async execute(
    input: UpdateStatusInscriptionInput,
  ): Promise<UpdateStatusInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `attempt to search for registration data for analysis but the registration was not found, id: ${input.inscriptionId}`,
        `Inscrição não encontrada`,
        UpdateStatusInscriptionUsecase.name,
      );
    }

    const payment = await this.paymentInscriptionGateway.findbyInscriptionId(
      inscription.getId(),
    );

    if (payment && payment.length >= 1) {
      throw new InscriptionHasPaymentUsecaseException(
        `attempt to delete inscription ${input.inscriptionId} that already has linked payments`,
        `Não é possível excluir uma inscrição que já possui pagamentos vinculados.`,
        UpdateStatusInscriptionUsecase.name,
      );
    }

    const newInscriptionStatus = await this.inscriptionGateway.updateStatus(
      input.inscriptionId,
      input.statusInscription,
    );

    const output: UpdateStatusInscriptionOutput = {
      id: newInscriptionStatus.getId(),
      status: newInscriptionStatus.getStatus(),
    };
    return output;
  }
}
