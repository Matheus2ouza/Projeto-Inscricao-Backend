import type { ComponentType } from 'react';
import type {
  EventResponsibleEmailData,
  InscriptionEmailData,
} from '../types/inscription/inscription-email.types';
import type { PaymentEmailData } from '../types/payment/payment-email.types';
import type { PaymentReviewNotificationEmailData } from '../types/payment/payment-review-notification-email.types';
import type { TicketReleaseEmailData } from '../types/tickets/ticket-release-email.types';
import type { TicketSaleNotificationEmailData } from '../types/tickets/ticket-sale-notification-email.types';

export type TemplateCategory = 'payment' | 'inscription' | 'tickets';

export interface TemplateDefinition {
  id: string;
  category: TemplateCategory;
  title: string;
  description?: string;
  previewText?: string;
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  getProps: () => Record<string, unknown>;
}

const mockPaymentData = (
  overrides: Partial<PaymentEmailData> = {},
): PaymentEmailData => ({
  paymentId: 'pay_123456',
  inscriptionId: 'insc_987654',
  eventId: 'event_001',
  eventName: 'Congresso de Tecnologia 2025',
  responsibleName: 'Marina Costa',
  responsibleEmail: 'marina.costa@example.com',
  responsiblePhone: '+55 (11) 91234-5678',
  paymentValue: 259.9,
  paymentDate: new Date('2025-03-18T10:30:00Z'),
  rejectionReason: 'Transação não autorizada pelo emissor.',
  ...overrides,
});

const mockResponsibles = (): EventResponsibleEmailData[] => [
  {
    id: 'resp-001',
    username: 'Marina Costa',
    email: 'marina.costa@example.com',
  },
  {
    id: 'resp-002',
    username: 'Eduardo Pereira',
    email: 'eduardo.pereira@example.com',
  },
];

const mockInscriptionData = (): InscriptionEmailData => ({
  eventName: 'Congresso de Tecnologia 2025',
  eventImageUrl:
    'https://images.unsplash.com/photo-1522199991270-763bc0d49ef1?auto=format&w=600&q=80',
  responsibleName: 'Marina Costa',
  responsiblePhone: '+55 (11) 91234-5678',
  responsibleEmail: 'marina.costa@example.com',
  totalValue: 2590.5,
  participantCount: 12,
  accountUsername: 'tech-events-admin',
  inscriptionDate: new Date('2025-03-16T19:42:00Z'),
  eventStartDate: new Date('2025-04-05T08:00:00Z'),
  eventEndDate: new Date('2025-04-07T18:00:00Z'),
  eventLocation: 'São Paulo Expo, São Paulo - SP',
});

const mockPaymentReviewNotificationData =
  (): PaymentReviewNotificationEmailData => ({
    paymentId: 'pay_123456',
    inscriptionId: 'insc_987654',
    eventName: 'Congresso de Tecnologia 2025',
    eventLocation: 'São Paulo Expo, São Paulo - SP',
    eventStartDate: new Date('2025-04-05T08:00:00Z'),
    eventEndDate: new Date('2025-04-07T18:00:00Z'),
    paymentValue: 259.9,
    paymentDate: new Date('2025-03-18T10:30:00Z'),
    payerName: 'Marina Costa',
    payerEmail: 'marina.costa@example.com',
    payerPhone: '+55 (11) 91234-5678',
    accountUsername: 'tech-events-admin',
  });

const mockTicketReleaseData = (): TicketReleaseEmailData => ({
  buyerName: 'Carolina Dias',
  eventName: 'Congresso de Tecnologia 2025',
  totalTickets: 4,
  saleId: 'sale_ABC123',
});

const mockTicketSaleNotificationData =
  (): TicketSaleNotificationEmailData => ({
    saleId: 'sale_ABC123',
    paymentId: 'pay_123456',
    eventName: 'Congresso de Tecnologia 2025',
    eventLocation: 'São Paulo Expo, São Paulo - SP',
    eventStartDate: new Date('2025-04-05T08:00:00Z'),
    eventEndDate: new Date('2025-04-07T18:00:00Z'),
    buyerName: 'Carolina Dias',
    buyerEmail: 'carolina@example.com',
    buyerPhone: '+55 (11) 91234-5678',
    totalValue: 129.9,
    paymentMethod: 'PIX',
    paymentValue: 129.9,
    submittedAt: new Date(),
  });

export const templateDefinitions: TemplateDefinition[] = [
  {
    id: 'payment/payment-approved',
    category: 'payment',
    title: 'Pagamento aprovado',
    description: 'Confirmação de pagamento com detalhes do pedido.',
    previewText: 'Pagamento confirmado com sucesso.',
    loader: async () => {
      const module = await import(
        '../templates/payment/payment-approved/index.js'
      );
      return { default: module.PaymentApprovedEmail };
    },
    getProps: () => ({
      paymentData: mockPaymentData({ rejectionReason: undefined }),
      loginUrl:
        process.env.FRONTEND_LOGIN_URL ?? 'https://portal.inscricao.dev/login',
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'payment/payment-rejected',
    category: 'payment',
    title: 'Pagamento reprovado',
    description: 'Aviso de falha no processamento do pagamento.',
    previewText: 'Seu pagamento foi reprovado.',
    loader: async () => {
      const module = await import(
        '../templates/payment/payment-rejected/index.js'
      );
      return { default: module.PaymentRejectedEmail };
    },
    getProps: () => ({
      paymentData: mockPaymentData(),
      loginUrl:
        process.env.FRONTEND_LOGIN_URL ?? 'https://portal.inscricao.dev/login',
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'payment/payment-review-notification',
    category: 'payment',
    title: 'Novo pagamento em análise',
    description:
      'Alerta os responsáveis do evento quando um pagamento é enviado para conferência.',
    previewText: 'Um pagamento foi recebido e aguarda análise.',
    loader: async () => {
      const module = await import(
        '../templates/payment/payment-review-notification/index.js'
      );
      return { default: module.PaymentReviewNotificationEmail };
    },
    getProps: () => ({
      paymentData: mockPaymentReviewNotificationData(),
      responsibles: mockResponsibles(),
      year: new Date().getFullYear(),
      currentDate: new Date(),
    }),
  },
  {
    id: 'inscription/inscription-notification',
    category: 'inscription',
    title: 'Nova inscrição registrada',
    description: 'Resumo completo da inscrição para responsáveis do evento.',
    previewText: 'Uma nova inscrição foi registrada no evento.',
    loader: async () => {
      const module = await import(
        '../templates/inscription/inscription-notification/index.js'
      );
      return { default: module.InscriptionNotificationEmail };
    },
    getProps: () => ({
      eventData: mockInscriptionData(),
      responsibles: mockResponsibles(),
      year: new Date().getFullYear(),
      currentDate: new Date(),
    }),
  },
  {
    id: 'tickets/pre-sale-approved',
    category: 'tickets',
    title: 'Tickets liberados',
    description: 'Envia os tickets aprovados ao comprador.',
    previewText: 'Seus tickets estão liberados.',
    loader: async () => {
      const module = await import(
        '../templates/tickets/pre-sale-approved/index.js'
      );
      return { default: module.TicketPreSaleApprovedEmail };
    },
    getProps: () => ({
      ticketData: mockTicketReleaseData(),
      downloadsUrl:
        process.env.FRONTEND_LOGIN_URL ?? 'https://portal.inscricao.dev/login',
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'tickets/pre-sale-notification',
    category: 'tickets',
    title: 'Nova pré-venda',
    description:
      'Notifica os responsáveis do evento quando uma nova venda é submetida.',
    previewText: 'Uma nova pré-venda aguarda validação.',
    loader: async () => {
      const module = await import(
        '../templates/tickets/pre-sale-notification/index.js'
      );
      return { default: module.TicketSaleNotificationEmail };
    },
    getProps: () => ({
      saleData: mockTicketSaleNotificationData(),
      responsibles: mockResponsibles(),
      year: new Date().getFullYear(),
      currentDate: new Date(),
    }),
  },
];

export const categories = Array.from(
  new Set(templateDefinitions.map((template) => template.category)),
) as TemplateCategory[];

export const templatesByCategory = templateDefinitions.reduce<
  Record<TemplateCategory, TemplateDefinition[]>
>(
  (accumulator, template) => {
    if (!accumulator[template.category]) {
      accumulator[template.category] = [];
    }
    accumulator[template.category].push(template);
    return accumulator;
  },
  {
    payment: [],
    inscription: [],
    tickets: [],
  },
);

export const findTemplate = (category: string, name: string) => {
  const id = `${category}/${name}`;
  return templateDefinitions.find((template) => template.id === id);
};
