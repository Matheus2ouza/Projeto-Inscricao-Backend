import { Injectable } from '@nestjs/common';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  PaymentMode,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';
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
  phone: string;
  createdAt: Date;
  totalValue: number;
  totalPaid: number;
  locality: Locality;
  participant: Participant;
  payments?: Payment[];
  eventConfig: EventConfig;
};

export type EventConfig = {
  participanteConfig: ParticipantFieldsConfig;
  allowedPaymentModes: PaymentMode[];
};

export type Locality = {
  id: string;
  name: string;
};

export type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  cpf: string;
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
  imageUrls: string[];
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
    private readonly eventGateway: EventGateway,
    private readonly localityGateway: LocalityGateway,
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

    const [event, locality, participants, payments] = await Promise.all([
      this.eventGateway.findById(inscription.getEventId()),
      this.localityGateway.findById(inscription.getLocalityId()!),
      this.participantGateway.findByInscriptionId(inscription.getId()),
      this.paymentGateway.findAllByInscriptionId(inscription.getId()),
    ]);

    // Pega o primeiro participante (sempre será 1 para guest)
    const participant = participants[0];

    if (!participant) {
      throw new Error('Participant not found for this inscription');
    }

    // Busca o tipo de inscrição do participante
    const typeInscription = await this.typeInscriptionGateway.findById(
      participant.getTypeInscriptionId(),
    );

    const participantData: Participant = {
      id: participant.getId(),
      name: participant.getName(),
      birthDate: participant.getBirthDate(),
      gender: participant.getGender(),
      preferredName: participant.getPreferredName(),
      shirtSize: participant.getShirtSize(),
      shirtType: participant.getShirtType(),
      cpf: participant.getCpf()!,
      typeInscription: {
        description: typeInscription?.getDescription() ?? '',
        price: typeInscription?.getValue() ?? 0,
      },
    };

    const paymentsData = await Promise.all(
      payments.map(async (payment) => {
        const imagePath = await this.getPublicUrls(payment.getImageUrls());

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
          imageUrls: imagePath,
          totalValue: payment.getTotalValue(),
          totalPaid: payment.getTotalPaid(),
          paidInstallments: payment.getPaidInstallments(),
          paymentInstallment: paymentInstallmentData,
        };
      }),
    );

    const localityData: Locality = {
      id: locality?.getId() ?? '',
      name: `${locality?.getName()} - ${locality?.getUf()}`,
    };

    const eventConfig: EventConfig = {
      participanteConfig: event?.getParticipantFieldsConfig()!,
      allowedPaymentModes: event?.getAllowedPaymentModes()!,
    };

    const output: FindDetailsGuestInscriptionOutput = {
      id: inscription.getId(),
      status: inscription.getStatus(),
      guestEmail: inscription.getGuestEmail() ?? '',
      guestName: inscription.getGuestName() ?? '',
      phone: inscription.getPhone() ?? '',
      createdAt: inscription.getCreatedAt(),
      totalValue: inscription.getTotalValue(),
      totalPaid: inscription.getTotalPaid(),
      locality: localityData,
      participant: participantData,
      payments: paymentsData,
      eventConfig,
    };

    return output;
  }

  private async getPublicUrls(paths: string[] = []): Promise<string[]> {
    if (!paths.length) {
      return [];
    }

    const publicUrls = await Promise.all(
      paths.map(async (path) => {
        try {
          return await this.supabaseStorageService.getPublicUrl(path);
        } catch {
          return '';
        }
      }),
    );

    return publicUrls.filter(Boolean);
  }
}
