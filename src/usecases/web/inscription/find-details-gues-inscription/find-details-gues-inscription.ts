import { Injectable } from '@nestjs/common';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';

export type FindDetailsGuestInscriptionInput = {
  confirmationCode: string;
};

export type FindDetailsGuestInscriptionOutput = {
  id: string;
  status: InscriptionStatus;
  guestEmail: string;
  guestName: string;
  guestLocality: string;
  phone: string;
  createdAt: Date;
  participants: Participant[];
  payment?: Payment;
};

export type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  typeInscription: TypeInscription;
};

export type TypeInscription = {
  description: string;
  price: number;
};

export type Payment = {
  id: string;
  status: StatusPayment;
  method: PaymentMethod;
  installments: number;
  rejectionReason?: string;
  imageUrl?: string;
  totalValue: number;
  totalPaid: number;
  paidInstallments: number;
  PaymentInstallment: PaymentInstallment[];
};

export type PaymentInstallment = {
  id: string;
  installmentNumber: number;
  value: number;
  paidAt?: Date;
};

@Injectable()
export class FindDetailsGuestInscriptionUsecase
  implements
    Usecase<FindDetailsGuestInscriptionInput, FindDetailsGuestInscriptionOutput>
{
  constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
  ) {}

  async execute(
    input: FindDetailsGuestInscriptionInput,
  ): Promise<FindDetailsGuestInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findByConfirmationCode(
      input.confirmationCode,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `inscription with confirmation code ${input.confirmationCode} not found`,
        `Nenhuma inscrição encontrada com o código fornecido.`,
        FindDetailsGuestInscriptionUsecase.name,
      );
    }

    const [participants, payments] = await Promise.all([
      this.participantGateway.findByInscriptionId(inscription.getId()),
      this.paymentGateway.findByInscriptionId(inscription.getId()),
    ]);

    const participantData = await Promise.all(
      participants.map(async (p) => {
        const typeInscription = await this.typeInscriptionGateway.findById(
          p.getTypeInscriptionId(),
        );

        if (!typeInscription) {
          return null;
        }
        const typeInscriptionData: TypeInscription = {
          description: typeInscription.getDescription(),
          price: typeInscription.getValue(),
        };

        return {
          id: p.getId(),
          name: p.getName(),
          birthDate: p.getBirthDate(),
          gender: p.getGender(),
          typeInscription: typeInscriptionData,
        };
      }),
    );

    const paymentInstallments = payments
      ? await this.paymentInstallmentGateway.findByPaymentId(payments.getId())
      : [];

    const participantsData: Participant[] = participantData.filter(
      (p): p is Participant => p !== null,
    );

    const paymentInstallmentData: PaymentInstallment[] =
      paymentInstallments.map((installment) => ({
        id: installment.getId(),
        installmentNumber: installment.getInstallmentNumber(),
        value: installment.getValue(),
        paidAt: installment.getPaidAt(),
      }));

    const paymentData = payments
      ? {
          id: payments.getId(),
          status: payments.getStatus(),
          method: payments.getMethodPayment(),
          installments: payments.getInstallments(),
          rejectionReason: payments.getRejectionReason(),
          imageUrl: payments.getImageUrl(),
          totalValue: inscription.getTotalValue(),
          totalPaid:
            await this.paymentAllocationGateway.sumPaidValueByInscription(
              inscription.getId(),
            ),
          paidInstallments: payments.getPaidInstallments(),
          PaymentInstallment: paymentInstallmentData,
        }
      : undefined;

    const output: FindDetailsGuestInscriptionOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
      guestEmail: inscription.getGuestEmail() ?? '',
      guestName: inscription.getGuestName() ?? '',
      guestLocality: inscription.getGuestLocality() ?? '',
      phone: inscription.getPhone() ?? '',
      createdAt: inscription.getCreatedAt(),
      participants: participantsData,
      payment: paymentData,
    };

    return output;
  }
}
