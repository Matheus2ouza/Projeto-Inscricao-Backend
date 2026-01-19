import { Injectable } from '@nestjs/common';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type FindDetailsInscriptionInput = {
  id: string;
};

export type FindDetailsInscriptionOutput = {
  inscription: Inscription;
  participants: Participant[];
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
};

type Participant = {
  id: string;
  typeInscription: string | undefined;
  name: string;
  birthDate: Date;
  gender: string;
};

type Payment = {
  id: string;
  value: number;
  createdAt: Date;
};

@Injectable()
export class FindDetailsInscriptionUsecase
  implements Usecase<FindDetailsInscriptionInput, FindDetailsInscriptionOutput>
{
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
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

    const [payments, participantLinks] = await Promise.all([
      this.paymentAllocationGateway.findbyInscriptionId(input.id),
      this.accountParticipantInEventGateway.findParticipantDetailsByInscriptionId(
        input.id,
      ),
    ]);

    let totalPaid = 0;

    // Processar os pagamentos para obter as URLs públicas
    const enrichedPayments = await Promise.all(
      payments.map(async (p) => {
        const payment: Payment = {
          id: p.getId(),
          value: p.getValue(),
          createdAt: p.getCreatedAt(),
        };
        totalPaid += p.getValue();
        return payment;
      }),
    );

    const participantsData: Participant[] = participantLinks.map((p) => ({
      id: p.participantId,
      typeInscription: p.typeInscriptionDescription || undefined,
      name: p.name,
      birthDate: p.birthDate,
      gender: p.gender,
    }));

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
      },
      payments: enrichedPayments,
      participants: participantsData,
    };

    return output;
  }
}
