import * as ExcelJS from 'exceljs';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';
import { InscriptionsSheetBuilder } from './builders/inscriptions-sheet.builder';
import { ParticipantsSheetBuilder } from './builders/participants-sheet.builder';
import { PaymentsSheetBuilder } from './builders/payments-sheet.builder';
import { SummarySheetBuilder } from './builders/summary-sheet.builder';

export type ListInscriptionsXlsxParticipant = {
  name: string;
  birthDate: Date;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender: genderType;
};

export type ListInscriptionsXlsxInscription = {
  id: string;
  responsible: string;
  email?: string;
  phone?: string;
  locality: string;
  status: InscriptionStatus;
  createdAt: Date;
  isGuest?: boolean;
  participants?: ListInscriptionsXlsxParticipant[];
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

export type ListInscriptionsXlsxData = {
  header: {
    title: string;
    titleDetail?: string;
    subtitle?: string;
  };
  inscriptions: ListInscriptionsXlsxInscription[];
  totals?: {
    totalInscriptions?: number;
    totalAccountParticipants: number;
    totalGuestParticipants: number;
  };
  participantSummary?: {
    total: number;
    male: number;
    female: number;
  };
  paymentSummary?: {
    byMethod: Array<{
      method: PaymentMethod;
      totalValue: number;
      totalPaid: number;
      totalNetValue: number;
      totalReceived: number;
    }>;
  };
};

export class ListInscriptionsXlsxGeneratorUtils {
  public static async generateListInscriptionsXlsx(
    data: ListInscriptionsXlsxData,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Projeto-Inscricao-Backend';
    workbook.created = new Date();

    // Calcular mapas de linhas antes de renderizar as abas
    const paymentLineMap = this.calculatePaymentLineMap(data);
    const participantLineMap = this.calculateParticipantLineMap(data);
    const inscriptionLineMap = this.calculateInscriptionLineMap(data);

    // Construir sheets usando os builders
    SummarySheetBuilder.build(workbook, data);
    InscriptionsSheetBuilder.build(
      workbook,
      data,
      paymentLineMap,
      participantLineMap,
    );
    ParticipantsSheetBuilder.build(workbook, data, inscriptionLineMap);
    PaymentsSheetBuilder.build(workbook, data, inscriptionLineMap);

    const arrayBuffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
    return Buffer.from(arrayBuffer);
  }

  /**
   * Calcula em qual linha cada inscrição aparece na aba de Inscrições
   */
  private static calculateInscriptionLineMap(
    data: ListInscriptionsXlsxData,
  ): Map<string, number> {
    const map = new Map<string, number>();
    let currentRow = 2; // Linha 1 é o header

    for (const inscription of data.inscriptions) {
      map.set(inscription.id, currentRow);
      currentRow++;
    }

    return map;
  }

  /**
   * Calcula em qual linha cada inscrição aparece pela primeira vez na aba de Pagamentos
   */
  private static calculatePaymentLineMap(
    data: ListInscriptionsXlsxData,
  ): Map<string, number> {
    const map = new Map<string, number>();
    let currentRow = 2; // Linha 1 é o header

    for (const inscription of data.inscriptions) {
      if (inscription.payments && inscription.payments.length > 0) {
        map.set(inscription.id, currentRow);

        // Calcular quantas linhas esse pagamento vai ocupar
        for (const payment of inscription.payments) {
          const installments = payment.installments?.length
            ? payment.installments
            : [undefined];
          currentRow += installments.length;
        }
      }
    }

    return map;
  }

  /**
   * Calcula em qual linha cada inscrição aparece pela primeira vez na aba de Participantes
   */
  private static calculateParticipantLineMap(
    data: ListInscriptionsXlsxData,
  ): Map<string, number> {
    const map = new Map<string, number>();
    let currentRow = 2; // Linha 1 é o header

    for (const inscription of data.inscriptions) {
      if (inscription.participants && inscription.participants.length > 0) {
        map.set(inscription.id, currentRow);
        currentRow += inscription.participants.length;
      }
    }

    return map;
  }
}
