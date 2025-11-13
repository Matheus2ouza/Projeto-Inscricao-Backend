import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { genderType, InscriptionStatus, PaymentMethod } from 'generated/prisma';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type CreateInscriptionAvulInput = {
  eventId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
  accountId: string;
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
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
  ) {}

  async execute(
    input: CreateInscriptionAvulInput,
  ): Promise<CreateInscriptionAvulOutput> {
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

    const totalPaymentsValue = payments.reduce(
      (acc, payment) => acc.plus(payment.getValue()),
      new Decimal(0),
    );

    const financialMovements = payments.map((payment) =>
      FinancialMovement.create({
        eventId: eventExists.getId(),
        accountId: input.accountId,
        type: 'INCOME',
        value: payment.getValue(),
      }),
    );

    await Promise.all(
      financialMovements.map((financialMovement) =>
        this.financialMovementGateway.create(financialMovement),
      ),
    );

    await this.eventGateway.incrementAmountCollected(
      eventExists.getId(),
      totalPaymentsValue.toNumber(),
    );

    return { id: createdRegistration.getId() };
  }
}
