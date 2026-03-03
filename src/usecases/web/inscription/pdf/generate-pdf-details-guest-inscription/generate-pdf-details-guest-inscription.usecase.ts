import { Injectable } from '@nestjs/common';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { InscriptionDetailsPdfGeneratorUtils } from 'src/shared/utils/pdfs/inscriptions/inscription-details-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type GeneratePdfDetailsGuestInscriptionInput = {
  inscriptionId: string;
};

export type GeneratePdfDetailsGuestInscriptionOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfDetailsGuestInscriptionUsecase
  implements
    Usecase<
      GeneratePdfDetailsGuestInscriptionInput,
      GeneratePdfDetailsGuestInscriptionOutput
    >
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
  ) {}

  async execute(
    input: GeneratePdfDetailsGuestInscriptionInput,
  ): Promise<GeneratePdfDetailsGuestInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
      { isGuest: true },
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `Inscription with id ${input.inscriptionId} not found.`,
        `Inscrição não encontrada.`,
        GeneratePdfDetailsGuestInscriptionUsecase.name,
      );
    }

    const participants = await this.participantGateway.findByInscriptionId(
      inscription.getId(),
    );

    const event = await this.eventGateway.findById(inscription.getEventId());

    const payments = await this.paymentGateway.findAllByInscriptionId(
      inscription.getId(),
    );

    const installmentsByPaymentId = new Map<
      string,
      Awaited<ReturnType<PaymentInstallmentGateway['findManyByPaymentId']>>
    >();

    if (payments.length > 0) {
      const installmentsLists = await Promise.all(
        payments.map((p) =>
          this.paymentInstallmentGateway.findManyByPaymentId(p.getId()),
        ),
      );

      for (let i = 0; i < payments.length; i += 1) {
        installmentsByPaymentId.set(payments[i].getId(), installmentsLists[i]);
      }
    }

    const participantsData = participants.map((p, index) => {
      const complementary: { label: string; value: string }[] = [];

      if (p.getShirtSize)
        complementary.push({
          label: 'Tamanho da camisa',
          value: String(p.getShirtSize()),
        });
      if (p.getShirtType)
        complementary.push({
          label: 'Modelo da camisa',
          value: String(p.getShirtType()),
        });

      return {
        title: `Participante ${index + 1}`,
        name: p.getName ? String(p.getName()) : '-',
        cpf: p.getCpf ? String(p.getCpf()) : undefined,
        birthDate: p.getBirthDate ? (p.getBirthDate() as Date) : undefined,
        age: p.getBirthDate
          ? this.calculateAge(p.getBirthDate() as Date)
          : undefined,
        gender: p.getGender ? String(p.getGender()) : undefined,
        complementary,
      };
    });

    const paymentsData = payments
      .sort((a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime())
      .map((payment, index) => {
        const totals = [
          {
            label: 'Total',
            value: this.formatCurrency(payment.getTotalValue()),
          },
          { label: 'Pago', value: this.formatCurrency(payment.getTotalPaid()) },
          {
            label: 'Recebido',
            value: this.formatCurrency(payment.getTotalReceived()),
          },
        ];

        const net = payment.getTotalNetValue();
        if (net && net > 0) {
          totals.push({
            label: 'Líquido',
            value: this.formatCurrency(net),
          });
        }

        const installments = installmentsByPaymentId.get(payment.getId()) ?? [];

        return {
          title: `Pagamento ${index + 1}`,
          id: payment.getId(),
          status: this.toPortuguesePaymentStatus(payment.getStatus()),
          method: this.toPortuguesePaymentMethod(payment.getMethodPayment()),
          createdAt: payment.getCreatedAt(),
          totals,
          installments: installments.map((i) => ({
            installmentNumber: i.getInstallmentNumber(),
            received: i.getReceived(),
            value: this.formatCurrency(i.getValue()),
            netValue: this.formatCurrency(i.getNetValue()),
            paidAt: i.getPaidAt(),
            estimatedAt: i.getEstimatedAt(),
          })),
        };
      });

    const inscriptionTotals = [
      {
        label: 'Total',
        value: this.formatCurrency(inscription.getTotalValue()),
      },
      { label: 'Pago', value: this.formatCurrency(inscription.getTotalPaid()) },
    ];

    const responsibleName = inscription.getIsGuest()
      ? (inscription.getGuestName() ?? inscription.getResponsible())
      : inscription.getResponsible();

    const pdfBuffer = await InscriptionDetailsPdfGeneratorUtils.generatePdf({
      eventName: event?.getName() ?? 'Evento',
      inscription: {
        id: inscription.getId(),
        isGuest: inscription.getIsGuest(),
        responsibleName,
        guestEmail: inscription.getGuestEmail(),
        guestLocality: inscription.getGuestLocality(),
        phone: inscription.getPhone(),
        email: inscription.getEmail(),
        status: this.toPortugueseInscriptionStatus(inscription.getStatus()),
        createdAt: inscription.getCreatedAt(),
        updatedAt: inscription.getUpdatedAt(),
        totals: inscriptionTotals,
      },
      participants: participantsData,
      payments: paymentsData,
    });

    const filename = this.buildFilename(
      event?.getName() ?? 'evento',
      inscription.getResponsible(),
    );

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename,
    };
  }

  private buildFilename(eventName: string, responsible: string): string {
    const sanitizedEventName = String(eventName ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();

    const sanitizedResponsibleName = String(responsible ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();

    return `detalhes-inscricao-${sanitizedEventName || 'evento'}-${sanitizedResponsibleName}.pdf`;
  }

  private calculateAge(birthDate: Date): number {
    const b = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const monthDiff = now.getMonth() - b.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < b.getDate())) {
      age -= 1;
    }

    return Math.max(0, age);
  }

  private formatCurrency(value: number): string {
    return Number(value ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private toPortuguesePaymentMethod(method: PaymentMethod): string {
    if (method === PaymentMethod.DINHEIRO) return 'Dinheiro';
    if (method === PaymentMethod.PIX) return 'Pix';
    if (method === PaymentMethod.CARTAO) return 'Cartão';
    return String(method);
  }

  private toPortuguesePaymentStatus(status: StatusPayment): string {
    if (status === StatusPayment.APPROVED) return 'Aprovado';
    if (status === StatusPayment.UNDER_REVIEW) return 'Em análise';
    if (status === StatusPayment.REFUSED) return 'Recusado';
    return String(status);
  }

  private toPortugueseInscriptionStatus(status: InscriptionStatus): string {
    if (status === InscriptionStatus.PENDING) return 'Pendente';
    if (status === InscriptionStatus.UNDER_REVIEW) return 'Em análise';
    if (status === InscriptionStatus.PAID) return 'Pago';
    if (status === InscriptionStatus.EXPIRED) return 'Expirado';
    if (status === InscriptionStatus.CANCELLED) return 'Cancelado';
    return String(status);
  }
}
