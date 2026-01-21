import { Injectable } from '@nestjs/common';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';

export type ListPaymentPendingDetailsInput = {
  inscriptionId: string;
  page: number;
  pageSize: number;
};

export type ListPaymentPendingDetailsOutput = {
  inscription: Inscription;
  participant: Participant[];
  payments: Payment[];
  allowCard: boolean;
  totalParticipant: number;
  totalPayment: number;
  page: number;
  pageCount: number;
};

type Inscription = {
  id: string;
  eventId: string;
  responsible: string;
  totalValue: number;
  status: string;
  createdAt: Date;
};

type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  gender: string;
};

type Payment = {
  id: string;
  status: string;
  totalValue: number;
  imageUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
};

@Injectable()
export class ListPaymentPendingDetailsUsecase
  implements
    Usecase<ListPaymentPendingDetailsInput, ListPaymentPendingDetailsOutput>
{
  constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  async execute(
    input: ListPaymentPendingDetailsInput,
  ): Promise<ListPaymentPendingDetailsOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(20, Math.floor(input.pageSize || 20));

    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `Inscription with id: ${input.inscriptionId} not found`,
        `Inscrição não encontrada`,
        ListPaymentPendingDetailsUsecase.name,
      );
    }

    const [participant, totalParticipant, payments, totalPayment, event] =
      await Promise.all([
        this.accountParticipantInEventGateway.findParticipantDetailsByInscriptionIdPaginated(
          inscription.getId(),
          safePage,
          safePageSize,
        ),
        this.accountParticipantInEventGateway.countParticipantByInscriptionId(
          inscription.getId(),
        ),
        this.paymentGateway.findAllByInscriptionIdPaginated(
          inscription.getId(),
          safePage,
          safePageSize,
        ),
        this.paymentGateway.countParticipantByInscriptionId(
          inscription.getId(),
        ),
        this.eventGateway.findById(inscription.getEventId()),
      ]);

    const participantData: Participant[] = participant.map((p) => ({
      id: p.participantId,
      name: p.name,
      birthDate: p.birthDate,
      gender: p.gender,
    }));

    const paymentData: Payment[] = payments.map((p) => ({
      id: p.getId(),
      status: p.getStatus(),
      totalValue: p.getTotalValue(),
      imageUrl: p.getImageUrl(),
      rejectionReason: p.getRejectionReason(),
      createdAt: p.getCreatedAt(),
    }));

    const inscriptionData: Inscription = {
      id: inscription.getId(),
      eventId: inscription.getEventId(),
      responsible: inscription.getResponsible(),
      totalValue: inscription.getTotalValue(),
      status: inscription.getStatus(),
      createdAt: inscription.getCreatedAt(),
    };

    const output: ListPaymentPendingDetailsOutput = {
      inscription: inscriptionData,
      participant: participantData,
      payments: paymentData,
      allowCard: event?.getAllowCard() || false,
      totalParticipant,
      totalPayment,
      page: safePage,
      pageCount: Math.ceil(totalPayment / safePageSize),
    };

    return output;
  }
}
