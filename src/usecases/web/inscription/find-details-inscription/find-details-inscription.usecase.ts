import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
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
};

type Inscription = {
  id: string;
  responsible: string;
  email?: string;
  phone?: string;
  status: string;
  totalValue: number;
  totalPaid: number;
  totalDebt: number;
  createdAt: Date;
  expiresAt?: Date;
};

type ParticipantAllocation = {
  id: string;
  typeInscription?: string;
  name?: string;
  birthDate?: Date;
  gender?: genderType;
};

type Payment = {
  id: string;
  paymentId: string;
  value: number;
  createdAt: Date;
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

    let participantsData: ParticipantAllocation[] = [];
    if (!inscription.getIsGuest()) {
      const accountParticipantInEvents =
        await this.accountParticipantInEventGateway.findByInscriptionId(
          inscription.getId(),
        );

      participantsData = await Promise.all(
        accountParticipantInEvents.map(async (p) => {
          const accountParticipant =
            await this.accountParticipantsGateway.findById(
              p.getAccountParticipantId(),
            );
          const typeInscription = await this.typeInscriptionGateway.findById(
            p.getTypeInscriptionId(),
          );

          return {
            id: p.getId(),
            typeInscription: typeInscription?.getDescription(),
            name: accountParticipant?.getName(),
            birthDate: accountParticipant?.getBirthDate(),
            gender: accountParticipant?.getGender(),
          };
        }),
      );
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
            typeInscription: typeInscription?.getDescription(),
            name: p.getName(),
            birthDate: p.getBirthDate(),
            gender: p.getGender(),
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
        totalValue: inscription.getTotalValue(),
        totalPaid: totalPaid,
        totalDebt: inscription.getTotalValue() - totalPaid,
        createdAt: inscription.getCreatedAt(),
        expiresAt: inscription.getExpiresAt(),
      },
      payments: enrichedPayments,
      participants: participantsData,
    };

    return output;
  }
}
