import * as ExcelJS from 'exceljs';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';

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

    this.buildSummarySheet(workbook, data);
    this.buildInscriptionsSheet(workbook, data);
    this.buildParticipantsSheet(workbook, data);
    this.buildPaymentsSheet(workbook, data);

    const arrayBuffer = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
    return Buffer.from(arrayBuffer);
  }

  private static buildSummarySheet(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
  ) {
    const ws = workbook.addWorksheet('Sumário');

    ws.addRow([data.header.title]);
    if (data.header.titleDetail) ws.addRow([data.header.titleDetail]);
    if (data.header.subtitle) ws.addRow([data.header.subtitle]);
    ws.addRow([]);

    ws.addRow(['Inscrições encontradas', data.inscriptions.length]);
    if (data.totals) {
      ws.addRow(['Total inscrições (contagem)', data.totals.totalInscriptions]);
      ws.addRow([
        'Total participantes (conta)',
        data.totals.totalAccountParticipants,
      ]);
      ws.addRow([
        'Total participantes (convidados)',
        data.totals.totalGuestParticipants,
      ]);
    }

    ws.addRow([]);

    // Por status
    const statusCounts = new Map<string, number>();
    const methodCounts = new Map<string, number>();

    for (const inscription of data.inscriptions) {
      const statusKey = formatInscriptionStatus(inscription.status);
      statusCounts.set(statusKey, (statusCounts.get(statusKey) ?? 0) + 1);

      if (inscription.payments?.length) {
        for (const payment of inscription.payments) {
          const methodKey = formatPaymentMethod(payment.methodPayment);
          methodCounts.set(methodKey, (methodCounts.get(methodKey) ?? 0) + 1);
        }
      } else {
        methodCounts.set(
          'Sem pagamento',
          (methodCounts.get('Sem pagamento') ?? 0) + 1,
        );
      }
    }

    ws.addRow(['Por status']);
    ws.addRow(['Status', 'Qtd.']);
    for (const [label, count] of [...statusCounts.entries()].sort((a, b) =>
      a[0].localeCompare(b[0], 'pt-BR'),
    )) {
      ws.addRow([label, count]);
    }

    ws.addRow([]);

    ws.addRow(['Por método de pagamento']);
    ws.addRow(['Método', 'Qtd.']);
    for (const [label, count] of [...methodCounts.entries()].sort((a, b) =>
      a[0].localeCompare(b[0], 'pt-BR'),
    )) {
      ws.addRow([label, count]);
    }

    if (data.participantSummary) {
      ws.addRow([]);
      ws.addRow(['Participantes']);
      ws.addRow(['Total', data.participantSummary.total]);
      ws.addRow(['Masculino', data.participantSummary.male]);
      ws.addRow(['Feminino', data.participantSummary.female]);
    }

    if (data.paymentSummary?.byMethod?.length) {
      ws.addRow([]);
      ws.addRow(['Resumo de Pagamentos']);
      ws.addRow(['Método', 'Total pago', 'Total líquido', 'Total recebido']);

      for (const item of data.paymentSummary.byMethod) {
        ws.addRow([
          formatPaymentMethod(item.method),
          item.totalValue,
          item.totalNetValue,
          item.totalReceived,
        ]);
      }
    }

    this.autoFitColumns(ws);
    this.applyHeaderStyles(ws, 1, 3);
  }

  private static buildInscriptionsSheet(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
  ) {
    const ws = workbook.addWorksheet('Inscrições');

    ws.columns = [
      { header: 'ID', key: 'id', width: 18 },
      { header: 'Responsável', key: 'responsible', width: 30 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Localidade', key: 'locality', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Convidado?', key: 'isGuest', width: 12 },
      { header: 'Criado em', key: 'createdAt', width: 20 },
      { header: 'Qtd. participantes', key: 'participantsCount', width: 18 },
      { header: 'Qtd. pagamentos', key: 'paymentsCount', width: 16 },
    ];

    ws.addRow(ws.columns.map((c) => c.header));

    for (const inscription of data.inscriptions) {
      ws.addRow([
        inscription.id,
        inscription.responsible,
        inscription.email ?? '',
        inscription.phone ?? '',
        inscription.locality ?? '',
        formatInscriptionStatus(inscription.status),
        inscription.isGuest ? 'Sim' : 'Não',
        formatDateTime(inscription.createdAt),
        inscription.participants?.length ?? 0,
        inscription.payments?.length ?? 0,
      ]);
    }

    this.applyTableHeaderStyle(ws, 1);
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length },
    };
  }

  private static buildParticipantsSheet(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
  ) {
    const hasAnyParticipants = data.inscriptions.some(
      (i) => i.participants && i.participants.length > 0,
    );
    if (!hasAnyParticipants) return;

    const ws = workbook.addWorksheet('Participantes');
    ws.columns = [
      { header: 'Inscrição ID', key: 'inscriptionId', width: 18 },
      { header: 'Nome', key: 'name', width: 32 },
      { header: 'Nascimento', key: 'birthDate', width: 14 },
      { header: 'Idade', key: 'age', width: 8 },
      { header: 'Tamanho camisa', key: 'shirtSize', width: 14 },
      { header: 'Tipo camisa', key: 'shirtType', width: 14 },
      { header: 'Gênero', key: 'gender', width: 12 },
    ];

    ws.addRow(ws.columns.map((c) => c.header));

    for (const inscription of data.inscriptions) {
      for (const participant of inscription.participants ?? []) {
        ws.addRow([
          inscription.id,
          participant.name,
          formatDate(participant.birthDate),
          formatAge(participant.birthDate),
          participant.shirtSize ?? '',
          participant.shirtType ?? '',
          formatGender(participant.gender),
        ]);
      }
    }

    this.applyTableHeaderStyle(ws, 1);
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length },
    };
  }

  private static buildPaymentsSheet(
    workbook: ExcelJS.Workbook,
    data: ListInscriptionsXlsxData,
  ) {
    const hasAnyPayments = data.inscriptions.some(
      (i) => i.payments && i.payments.length > 0,
    );
    if (!hasAnyPayments) return;

    const ws = workbook.addWorksheet('Pagamentos');
    ws.columns = [
      { header: 'Inscrição ID', key: 'inscriptionId', width: 18 },
      { header: 'Pagamento #', key: 'paymentIndex', width: 10 },
      { header: 'Nome (pagamento)', key: 'guestName', width: 28 },
      { header: 'Método', key: 'method', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Total pago', key: 'totalPaid', width: 14 },
      { header: 'Total recebido', key: 'totalReceived', width: 14 },
      { header: 'Criado em', key: 'createdAt', width: 20 },
      { header: 'Dir. comprovante', key: 'receiptPath', width: 30 },
      { header: 'Parcela', key: 'installmentNumber', width: 10 },
      { header: 'Recebido?', key: 'received', width: 10 },
      { header: 'Valor', key: 'value', width: 12 },
      { header: 'Valor líquido', key: 'netValue', width: 12 },
      { header: 'Pago em', key: 'paidAt', width: 20 },
    ];

    ws.addRow(ws.columns.map((c) => c.header));

    for (const inscription of data.inscriptions) {
      (inscription.payments ?? []).forEach((payment, paymentIdx) => {
        const installments = payment.installments?.length
          ? payment.installments
          : [undefined];

        for (const inst of installments) {
          ws.addRow([
            inscription.id,
            paymentIdx + 1,
            payment.guestName ?? '',
            formatPaymentMethod(payment.methodPayment),
            formatPaymentStatus(payment.status),
            payment.totalPaid,
            payment.totalReceived,
            formatDateTime(payment.createdAt),
            payment.receiptPath ?? '',
            inst?.installmentNumber ?? '',
            inst ? (inst.received ? 'Sim' : 'Não') : '',
            inst?.value ?? '',
            inst?.netValue ?? '',
            inst?.paidAt ? formatDateTime(inst.paidAt) : '',
          ]);
        }
      });
    }

    this.applyTableHeaderStyle(ws, 1);
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: ws.columns.length },
    };
  }

  private static applyTableHeaderStyle(ws: ExcelJS.Worksheet, headerRow = 1) {
    const row = ws.getRow(headerRow);
    row.font = { bold: true };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.commit();
  }

  private static applyHeaderStyles(
    ws: ExcelJS.Worksheet,
    startRow: number,
    endRow: number,
  ) {
    for (let r = startRow; r <= endRow; r++) {
      const row = ws.getRow(r);
      row.font = { bold: r === startRow, size: r === startRow ? 16 : 11 };
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      row.commit();
    }
  }

  private static autoFitColumns(ws: ExcelJS.Worksheet) {
    ws.columns?.forEach((col) => {
      if (!col) return;
      if (typeof (col as any).eachCell !== 'function') return;
      let max = 10;
      (col as any).eachCell({ includeEmpty: true }, (cell: any) => {
        const v = cell.value;
        const len = String(v ?? '').length;
        if (len > max) max = len;
      });
      col.width = Math.min(Math.max(max + 2, 10), 60);
    });
  }
}

function formatInscriptionStatus(status: InscriptionStatus): string {
  switch (status) {
    case 'PAID':
      return 'Pago';
    case 'PENDING':
      return 'Pendente';
    case 'UNDER_REVIEW':
      return 'Em análise';
    case 'CANCELLED':
      return 'Cancelado';
    case 'EXPIRED':
      return 'Expirado';
    default:
      return String(status);
  }
}

function formatPaymentMethod(method: PaymentMethod): string {
  switch (method) {
    case 'PIX':
      return 'PIX';
    case 'CARTAO':
      return 'Cartão';
    case 'DINHEIRO':
      return 'Dinheiro';
    default:
      return String(method);
  }
}

function formatPaymentStatus(status: StatusPayment): string {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado';
    case 'UNDER_REVIEW':
      return 'Em análise';
    case 'REFUSED':
      return 'Recusado';
    default:
      return String(status);
  }
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

function formatDate(date?: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatAge(date?: Date | null): string {
  if (!date) return '';

  const birthDate = new Date(date);
  if (Number.isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age < 0 ? '' : String(age);
}

function formatGender(gender?: genderType | null): string {
  if (!gender) return 'Não informado';

  switch (gender) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender).charAt(0) + String(gender).slice(1).toLowerCase();
  }
}
