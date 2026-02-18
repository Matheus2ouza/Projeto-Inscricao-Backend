import { Injectable } from '@nestjs/common';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionExpiredUsecaseException } from '../../exceptions/inscription/find/inscription-expired.usecase.exception';
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
  totalValue: number;
  totalPaid: number;
  participants: Participant[];
  payments?: Payment[];
};

export type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
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
  paymentInstallment: PaymentInstallment[];
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
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
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

    if (inscription.getStatus() === InscriptionStatus.EXPIRED) {
      throw new InscriptionExpiredUsecaseException(
        `inscription with confirmation code ${input.confirmationCode} is expired`,
        `A inscrição com o código fornecido expirou.`,
        FindDetailsGuestInscriptionUsecase.name,
      );
    }

    const [participants, payments] = await Promise.all([
      this.participantGateway.findByInscriptionId(inscription.getId()),
      this.paymentGateway.findAllByInscriptionId(inscription.getId()),
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
          preferredName: p.getPreferredName(),
          shirtSize: p.getShirtSize(),
          shirtType: p.getShirtType(),
          gender: p.getGender(),
          typeInscription: typeInscriptionData,
        };
      }),
    );

    const paymentsData = await Promise.all(
      payments.map(async (payment) => {
        const imagePath = await this.getPublicUrl(payment.getImageUrl());

        const installments =
          await this.paymentInstallmentGateway.findByPaymentId(payment.getId());

        const paymentInstallmentData: PaymentInstallment[] = installments.map(
          (installment) => ({
            id: installment.getId(),
            installmentNumber: installment.getInstallmentNumber(),
            value: installment.getValue(),
            paidAt: installment.getPaidAt(),
          }),
        );

        return {
          id: payment.getId(),
          status: payment.getStatus(),
          method: payment.getMethodPayment(),
          installments: payment.getInstallments(),
          rejectionReason: payment.getRejectionReason(),
          imageUrl: imagePath,
          totalValue: payment.getTotalValue(),
          totalPaid: payment.getTotalPaid(),
          paidInstallments: payment.getPaidInstallments(),
          paymentInstallment: paymentInstallmentData,
        };
      }),
    );

    const participantsData = participantData.reduce<Participant[]>(
      (acc, participant) => {
        if (participant) {
          acc.push(participant);
        }
        return acc;
      },
      [],
    );

    const output: FindDetailsGuestInscriptionOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
      guestEmail: inscription.getGuestEmail() ?? '',
      guestName: inscription.getGuestName() ?? '',
      guestLocality: inscription.getGuestLocality() ?? '',
      phone: inscription.getPhone() ?? '',
      createdAt: inscription.getCreatedAt(),
      totalValue: inscription.getTotalValue(),
      totalPaid: inscription.getTotalPaid(),
      participants: participantsData,
      payments: paymentsData,
    };

    return output;
  }

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }
}
