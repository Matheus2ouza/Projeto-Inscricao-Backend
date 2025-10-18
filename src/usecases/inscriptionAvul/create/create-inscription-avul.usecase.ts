import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { genderType, InscriptionStatus, PaymentMethod } from 'generated/prisma';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreateInscriptionAvulInput = {
  eventId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
  participants: {
    name: string;
    birthDate: Date;
    gender: genderType;
    payments: {
      paymentMethod: PaymentMethod;
      value: Decimal;
    }[];
  }[];
};

export type CreateInscriptionAvulOutput = {
  id: string;
};

@Injectable()
export class CreateInscriptionAvulUsecase
  implements Usecase<CreateInscriptionAvulInput, CreateInscriptionAvulOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
  ) {}

  async execute(
    input: CreateInscriptionAvulInput,
  ): Promise<CreateInscriptionAvulOutput> {
    console.log(input.eventId);
    const eventExists = await this.eventGateway.findById(input.eventId);

    if (!eventExists) {
      console.log(eventExists);
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        CreateInscriptionAvulUsecase.name,
      );
    }

    const registration = OnSiteRegistration.create({
      eventId: input.eventId,
      responsible: input.responsible,
      phone: input.phone,
      totalValue: new Decimal(input.totalValue),
      status: input.status,
    });

    const participantsWithPayments = input.participants.map((p) => {
      const participantPayments = p.payments ?? [];

      const participant = OnSiteParticipant.create({
        onSiteRegistrationId: registration.getId(),
        name: p.name,
        gender: p.gender,
      });

      const payments = participantPayments.map((payment) =>
        OnSiteParticipantPayment.create({
          participantId: participant.getId(),
          paymentMethod: payment.paymentMethod,
          value: new Decimal(payment.value),
        }),
      );

      return { participant, payments };
    });

    const payments = participantsWithPayments.flatMap(
      ({ payments: participantPayments }) => participantPayments,
    );

    const participants = participantsWithPayments.map(
      ({ participant }) => participant,
    );

    const createdRegistration =
      await this.onSiteRegistrationGateway.createWithParticipantsAndPayments(
        registration,
        participants,
        payments,
      );

    return { id: createdRegistration.getId() };
  }
}
