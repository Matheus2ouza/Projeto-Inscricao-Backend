import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { Usecase } from 'src/usecases/usecase';
import { OnSiteRegistrationNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/avul/onSiteRegistration-not-fund-usecase.exception';

export type FindDetailsInscriptionAvulInput = {
  id: string;
};

export type FindDetailsInscriptionAvulOutput = {
  id: string;
  name: string;
  createdAt: Date;
  onSiteParticipan: OnSiteParticipant[];
};

type OnSiteParticipant = {
  id: string;
  name: string;
  gender: string;
  onSiteParticipantPayment: OnSiteParticipantPayment[];
};

type OnSiteParticipantPayment = {
  id: string;
  paymentMethod: PaymentMethod;
  value: number;
};

@Injectable()
export class FindDetailsInscriptionAvulUsecase
  implements
    Usecase<FindDetailsInscriptionAvulInput, FindDetailsInscriptionAvulOutput>
{
  constructor(
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly onSiteParticipantGateway: OnSiteParticipantGateway,
    private readonly onSiteParticipantPaymentGateway: OnSiteParticipantPaymentGateway,
  ) {}

  public async execute(
    input: FindDetailsInscriptionAvulInput,
  ): Promise<FindDetailsInscriptionAvulOutput> {
    const onSiteRegistration = await this.onSiteRegistrationGateway.findById(
      input.id,
    );

    if (!onSiteRegistration) {
      throw new OnSiteRegistrationNotFoundUsecaseException(
        `Inscription avulsa not found: ${input.id}`,
        `Inscrição não encontrada`,
        FindDetailsInscriptionAvulUsecase.name,
      );
    }

    const onSiteParticipans =
      await this.onSiteParticipantGateway.findManyByOnSiteRegistrationId(
        onSiteRegistration.getId(),
      );

    const onSiteParticipan = await Promise.all(
      onSiteParticipans.map(async (p) => {
        const payments =
          await this.onSiteParticipantPaymentGateway.findManyByOnSiteParticipantsPayment(
            p.getId(),
          );

        const payment = payments.map((p) => ({
          id: p.getId(),
          paymentMethod: p.getPaymentMethod(),
          value: p.getValue().toNumber(),
        }));

        return {
          id: p.getId(),
          name: p.getName(),
          gender: p.getGender(),
          onSiteParticipantPayment: payment,
        };
      }),
    );
    const output: FindDetailsInscriptionAvulOutput = {
      id: onSiteRegistration.getId(),
      name: onSiteRegistration.getResponsible(),
      createdAt: onSiteRegistration.getCreatedAt(),
      onSiteParticipan: onSiteParticipan,
    };

    return output;
  }
}
