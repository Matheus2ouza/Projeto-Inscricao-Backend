import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { genderType, InscriptionStatus, PaymentMethod } from 'generated/prisma';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { Usecase } from 'src/usecases/usecase';

export type CreateInscriptionAvulInput = {
  eventId: string;
  accountId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
  paymentMethod: PaymentMethod;
  participants: {
    value: Decimal;
    name: string;
    birthDate: Date;
    gender: genderType;
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
    private readonly onSiteParticipantGateway: OnSiteParticipantGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
  ) {}

  async execute(
    input: CreateInscriptionAvulInput,
  ): Promise<CreateInscriptionAvulOutput> {
    const registration = OnSiteRegistration.create({
      eventId: input.eventId,
      accountId: input.accountId,
      responsible: input.responsible,
      phone: input.phone,
      paymentMethod: input.paymentMethod,
      totalValue: new Decimal(input.totalValue),
      status: input.status,
    });

    const createdRegistration =
      await this.onSiteRegistrationGateway.create(registration);

    const participants = input.participants.map((p) =>
      OnSiteParticipant.create({
        onSiteRegistrationId: createdRegistration.getId(),
        value: new Decimal(p.value),
        name: p.name,
        birthDate: p.birthDate,
        gender: p.gender,
      }),
    );

    await Promise.all(
      participants.map((participant) =>
        this.onSiteParticipantGateway.create(participant),
      ),
    );

    return { id: createdRegistration.getId() };
  }
}
