import { Injectable } from '@nestjs/common';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  ListInscriptionsXlsxData,
  ListInscriptionsXlsxGeneratorUtils,
} from 'src/shared/utils/xlsx/inscriptions/list-inscriptions-xlsx-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type GenerateXlsxAllInscriptionsInput = {
  eventId: string;

  // filtros
  participants?: boolean;
  payment?: boolean;
  status?: InscriptionStatus | InscriptionStatus[];
  statusPayment?: StatusPayment | StatusPayment[];
  methodPayment?: PaymentMethod | PaymentMethod[];
  isGuest?: boolean;
  startDate?: string;
  endDate?: string;
};

type InscriptionsDetails = {
  id: string;
  responsible: string;
  email?: string;
  phone?: string;
  locality: string;
  status: InscriptionStatus;
  createdAt: Date;
  isGuest?: boolean;
  participants?: ParticipantDetails[];
  payments?: Array<{
    methodPayment: PaymentMethod;
    guestName?: string;
    status: StatusPayment;
    totalPaid: number;
    totalReceived: number;
    createdAt: Date;
    receiptPath?: string;
    installments?: {
      installmentNumber: number;
      received: boolean;
      value: number;
      netValue: number;
      paidAt: Date;
    }[];
  }>;
};

type ParticipantDetails = {
  name: string;
  birthDate: Date;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender: genderType;
};

export type GenerateXlsxAllInscriptionsOutput = {
  fileBase64: string;
  filename: string;
  contentType:
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/zip';
};

@Injectable()
export class GenerateXlsxAllInscriptionsUsecase
  implements
    Usecase<GenerateXlsxAllInscriptionsInput, GenerateXlsxAllInscriptionsOutput>
{
  constructor(
    private readonly accountGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: GenerateXlsxAllInscriptionsInput,
  ): Promise<GenerateXlsxAllInscriptionsOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId}`,
        `Evento não encontrado`,
        GenerateXlsxAllInscriptionsUsecase.name,
      );
    }

    const filters = {
      status: input.status,
      statusPayment: input.statusPayment,
      methodPayment: input.methodPayment,
      isGuest: input.isGuest,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const [inscriptions, totalInscription, totalAccountParticipants] =
      await Promise.all([
        this.inscriptionGateway.findManyInscriptionsToGenerateReport(
          event.getId(),
          filters,
        ),
        this.inscriptionGateway.countAllInscriptionsToGenerateReport(
          event.getId(),
          filters,
        ),
        this.accountParticipantInEventGateway.countParticipantsByEventId(
          event.getId(),
        ),
      ]);

    let totalGuestParticipants = 0;
    if (input.isGuest !== false) {
      totalGuestParticipants = await this.participantGateway.countAllByEventId(
        event.getId(),
      );
    }

    // Acumuladores para os novos dados do sumário (mesma regra do PDF)
    let participantTotal = 0;
    let participantMale = 0;
    let participantFemale = 0;
    const paymentMethodMap = new Map<
      PaymentMethod,
      { totalValue: number; totalNetValue: number; totalReceived: number }
    >();

    const inscriptionDetails: InscriptionsDetails[] = await Promise.all(
      inscriptions.map(async (i) => {
        let participants: ParticipantDetails[] | undefined = undefined;

        if (input.participants) {
          const accountParticipants = (
            await this.accountParticipantGateway.findByInscriptionId(i.getId())
          ).map((p) => ({
            name: p.getName(),
            birthDate: p.getBirthDate(),
            shirtSize: p.getShirtSize(),
            shirtType: p.getShirtType(),
            gender: p.getGender(),
          }));

          let guestParticipants: ParticipantDetails[] = [];
          if (i.getIsGuest() && input.isGuest !== false) {
            guestParticipants = (
              await this.participantGateway.findByInscriptionId(i.getId())
            ).map((p) => ({
              name: p.getName(),
              birthDate: p.getBirthDate(),
              shirtSize: p.getShirtSize(),
              shirtType: p.getShirtType(),
              gender: p.getGender(),
            }));
          }

          participants = [...accountParticipants, ...guestParticipants];

          participantTotal += participants.length;
          for (const p of participants) {
            if (p.gender === 'MASCULINO') participantMale++;
            else if (p.gender === 'FEMININO') participantFemale++;
          }
        }

        let locality = '';
        if (i.getIsGuest()) {
          locality = i.getGuestLocality() ?? '';
        }

        if (!i.getIsGuest()) {
          const account = await this.accountGateway.findById(i.getAccountId()!);
          locality = account?.getUsername() ?? '';
        }

        const payments = input.payment
          ? await this.paymentGateway.findAllByInscriptionId(i.getId())
          : [];

        const paymentDetails = input.payment
          ? await Promise.all(
              payments.map(async (payment) => {
                const isPixPayment =
                  payment.getMethodPayment() === PaymentMethod.PIX;
                const extractedReceiptPath = isPixPayment
                  ? this.extractReceiptPath(payment.getImageUrl())
                  : undefined;

                const receiptPath = extractedReceiptPath
                  ? (await this.getPublicUrl(extractedReceiptPath)) ||
                    extractedReceiptPath
                  : undefined;

                const installments = (
                  await this.paymentInstallmentGateway.findByPaymentId(
                    payment.getId(),
                  )
                )
                  .map((installment) => ({
                    installmentNumber: installment.getInstallmentNumber(),
                    received: installment.getReceived(),
                    value: installment.getValue(),
                    netValue: installment.getNetValue(),
                    paidAt: installment.getPaidAt(),
                  }))
                  .sort((a, b) => a.installmentNumber - b.installmentNumber);

                const totalReceivedFromInstallments = installments
                  .filter((inst) => inst.received)
                  .reduce((sum, inst) => sum + inst.netValue, 0);

                if (input.payment) {
                  const method = payment.getMethodPayment();
                  const totalReceived =
                    totalReceivedFromInstallments || payment.getTotalReceived();

                  const existing = paymentMethodMap.get(method);
                  if (existing) {
                    existing.totalValue += payment.getTotalValue();
                    existing.totalNetValue += payment.getTotalNetValue();
                    existing.totalReceived += totalReceived;
                  } else {
                    paymentMethodMap.set(method, {
                      totalValue: payment.getTotalValue(),
                      totalNetValue: payment.getTotalNetValue(),
                      totalReceived,
                    });
                  }
                }

                return {
                  methodPayment: payment.getMethodPayment(),
                  guestName: payment.getGuestName(),
                  status: payment.getStatus(),
                  totalPaid: payment.getTotalPaid(),
                  totalReceived: payment.getTotalReceived(),
                  createdAt: payment.getCreatedAt(),
                  receiptPath,
                  installments,
                };
              }),
            )
          : undefined;

        return {
          id: i.getId(),
          responsible: i.getResponsible(),
          email: i.getEmail() ?? i.getGuestEmail(),
          phone: i.getPhone(),
          locality,
          status: i.getStatus(),
          createdAt: i.getCreatedAt(),
          isGuest: i.getIsGuest(),
          participants,
          payments:
            paymentDetails && paymentDetails.length
              ? paymentDetails
              : undefined,
        };
      }),
    );

    const participantSummary = input.participants
      ? {
          total: participantTotal,
          male: participantMale,
          female: participantFemale,
        }
      : undefined;

    const paymentSummary = input.payment
      ? {
          byMethod: Array.from(paymentMethodMap.entries())
            .map(([method, data]) => ({
              method,
              totalValue: data.totalValue,
              totalNetValue: data.totalNetValue,
              totalReceived: data.totalReceived,
            }))
            .sort((a, b) => a.method.localeCompare(b.method)),
        }
      : undefined;

    const xlsxData: ListInscriptionsXlsxData = {
      header: {
        title: event.getName() ?? 'Evento',
        titleDetail: this.formatEventPeriod(
          event.getStartDate(),
          event.getEndDate(),
        ),
        subtitle: 'Lista de Inscrições',
      },
      inscriptions: inscriptionDetails,
      totals: {
        totalInscriptions: totalInscription,
        totalAccountParticipants,
        totalGuestParticipants,
      },
      participantSummary,
      paymentSummary,
    };

    const xlsxBuffer =
      await ListInscriptionsXlsxGeneratorUtils.generateListInscriptionsXlsx(
        xlsxData,
      );

    return {
      fileBase64: xlsxBuffer.toString('base64'),
      filename: this.buildFilename(
        event.getName(),
        event.getId(),
        input.isGuest ?? false,
      ),
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }

  private buildFilename(
    eventName: string | undefined | null,
    eventId: string,
    isGuest: boolean,
  ): string {
    const sanitizedEventName = eventName
      ? eventName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()
      : 'evento';

    const suffix = isGuest ? 'convidados' : 'inscricoes';
    return `lista-${suffix}-${sanitizedEventName}-${eventId}.xlsx`;
  }

  private formatEventPeriod(
    startDate?: Date | null,
    endDate?: Date | null,
  ): string | undefined {
    const formattedStart = startDate
      ? new Date(startDate).toLocaleDateString('pt-BR')
      : undefined;
    const formattedEnd = endDate
      ? new Date(endDate).toLocaleDateString('pt-BR')
      : undefined;

    if (formattedStart && formattedEnd) {
      return `${formattedStart} até ${formattedEnd}`;
    }

    return formattedStart ?? formattedEnd ?? undefined;
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

  private extractReceiptPath(imageUrl?: string): string {
    if (!imageUrl) return '';

    const guestMarker = '/guest/';
    const normalMarker = '/normal/';

    const guestIndex = imageUrl.indexOf(guestMarker);
    if (guestIndex >= 0) {
      return `/${imageUrl.slice(guestIndex + guestMarker.length)}`;
    }

    const normalIndex = imageUrl.indexOf(normalMarker);
    if (normalIndex >= 0) {
      return `/${imageUrl.slice(normalIndex + normalMarker.length)}`;
    }

    return imageUrl;
  }
}
