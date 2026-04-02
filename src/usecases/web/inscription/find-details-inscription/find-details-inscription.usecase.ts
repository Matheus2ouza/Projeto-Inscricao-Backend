import { Injectable } from '@nestjs/common';
import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentLinkGateway } from 'src/domain/repositories/payment-link.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type FindDetailsInscriptionInput = {
  id: string;
};

export type FindDetailsInscriptionOutput = {
  inscription: Inscription;
  participants: ParticipantAllocation[];
  payments: Payment[];
  paymentLink?: PaymentLink;
};

type Inscription = {
  id: string;
  responsible: string;
  email?: string;
  phone?: string;
  status: string;
  observation?: string;
  totalValue: number;
  totalPaid: number;
  totalDebt: number;
  createdAt: Date;
  expiresAt?: Date;
};

type ParticipantAllocation = {
  id: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  typeInscription?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

type Payment = {
  id: string;
  paymentId: string;
  value: number;
  createdAt: Date;
};

type PaymentLink = {
  id: string;
  url: string;
  active: boolean;
};

@Injectable()
export class FindDetailsInscriptionUsecase
  implements Usecase<FindDetailsInscriptionInput, FindDetailsInscriptionOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantsGateway: AccountParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly paymentLinkGateway: PaymentLinkGateway,
  ) {}

  public async execute(
    input: FindDetailsInscriptionInput,
  ): Promise<FindDetailsInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(input.id);

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `User not found with finding user with id ${input.id}`,
        `Inscrição não encontrada`,
        FindDetailsInscriptionUsecase.name,
      );
    }

    const payments = await this.paymentAllocationGateway.findbyInscriptionId(
      inscription.getId(),
    );

    let totalPaid = 0;
    // Processar os pagamentos para obter as URLs públicas
    const enrichedPayments = await Promise.all(
      payments.map(async (p) => {
        const payment: Payment = {
          id: p.getId(),
          paymentId: p.getPaymentId(),
          value: p.getValue(),
          createdAt: p.getCreatedAt(),
        };
        totalPaid += p.getValue();
        return payment;
      }),
    );

    const paymentIdForPaymentLink =
      payments.length === 0
        ? undefined
        : payments
            .reduce((latest, current) => {
              return current.getCreatedAt() > latest.getCreatedAt()
                ? current
                : latest;
            })
            .getPaymentId();

    const paymentLinkEntity = paymentIdForPaymentLink
      ? await this.paymentLinkGateway.findByPaymentId(paymentIdForPaymentLink)
      : null;

    const paymentLink = paymentLinkEntity
      ? {
          id: paymentLinkEntity.getId(),
          url: paymentLinkEntity.getUrl(),
          active: paymentLinkEntity.getActive(),
        }
      : undefined;

    let participantsData: ParticipantAllocation[] = [];
    if (!inscription.getIsGuest()) {
      const accountParticipantInEvents =
        await this.accountParticipantInEventGateway.findByInscriptionId(
          inscription.getId(),
        );

      participantsData = (
        await Promise.all(
          accountParticipantInEvents.map(async (p) => {
            const accountParticipant =
              await this.accountParticipantsGateway.findById(
                p.getAccountParticipantId(),
              );

            if (!accountParticipant) return null;

            const typeInscription = await this.typeInscriptionGateway.findById(
              p.getTypeInscriptionId(),
            );

            return {
              id: p.getId(),
              name: accountParticipant.getName(),
              preferredName: accountParticipant.getPreferredName(),
              cpf: accountParticipant.getCpf(),
              typeInscription: typeInscription?.getDescription(),
              birthDate: accountParticipant.getBirthDate(),
              gender: accountParticipant.getGender(),
              shirtSize: accountParticipant.getShirtSize(),
              shirtType: accountParticipant.getShirtType(),
            };
          }),
        )
      ).filter((p) => p !== null) as ParticipantAllocation[];
    }

    if (inscription.getIsGuest()) {
      const participants = await this.participantGateway.findByInscriptionId(
        inscription.getId(),
      );

      participantsData = await Promise.all(
        participants.map(async (p) => {
          const typeInscription = await this.typeInscriptionGateway.findById(
            p.getTypeInscriptionId(),
          );
          return {
            id: p.getId(),
            name: p.getName(),
            preferredName: p?.getPreferredName(),
            cpf: p?.getCpf(),
            typeInscription: typeInscription?.getDescription(),
            birthDate: p.getBirthDate(),
            gender: p.getGender(),
            shirtSize: p.getShirtSize(),
            shirtType: p.getShirtType(),
          };
        }),
      );
    }

    const output: FindDetailsInscriptionOutput = {
      inscription: {
        id: inscription.getId(),
        responsible: inscription.getResponsible(),
        email: inscription.getEmail(),
        phone: inscription.getPhone(),
        status: inscription.getStatus(),
        observation: inscription.getObservation(),
        totalValue: inscription.getTotalValue(),
        totalPaid: totalPaid,
        totalDebt: inscription.getTotalValue() - totalPaid,
        createdAt: inscription.getCreatedAt(),
        expiresAt: inscription.getExpiresAt(),
      },
      payments: enrichedPayments,
      participants: participantsData,
      paymentLink,
    };

    return output;
  }
}
