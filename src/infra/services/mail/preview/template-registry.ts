import { PaymentMethod } from 'generated/prisma';
import type { ComponentType } from 'react';
import { Event } from 'src/domain/entities/event/event.entity.js';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import type { PaymentApprovedEmailProps } from '../templates/payment/payment-approved/index.js';
import { GuestExpiredEmailData } from '../types/inscription/guest-expired-email.types';
import type { GuestInscriptionEmailData } from '../types/inscription/guest-inscription-email.types';
import type {
  EventResponsibleEmailData,
  InscriptionEmailData,
} from '../types/inscription/inscription-email.types';
import type { InscriptionStatusEmailData } from '../types/inscription/inscription-status-email.types';
import { type PaymentProcessedNotificationEmailData } from '../types/payment/payment-processed-notification-email.types';
import type { PaymentReceiptUpdateEmailData } from '../types/payment/payment-receipt-update-email.types';
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
  loader: () => Promise<{ default: ComponentType<any> }>;
  getProps: () => Record<string, unknown>;
}

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

import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';

// ... outros mocks ...

const mockPaymentApprovedData = (): PaymentApprovedEmailProps => {
  // Mock do Event
  const mockEvent = {
    getId: () => 'event_001',
    getName: () => 'Congresso de Tecnologia 2025',
    getDescription: () => 'O maior congresso de tecnologia do Brasil',
    getStartDate: () => new Date('2025-04-05T08:00:00Z'),
    getEndDate: () => new Date('2025-04-07T18:00:00Z'),
    getLocation: () => 'São Paulo Expo, São Paulo - SP',
  } as unknown as Event;

  // Mock do Payment
  const mockPayment = {
    getId: () => 'pay_123456',
    getTotalValue: () => 789.7,
    getCreatedAt: () => new Date('2025-03-18T14:30:00Z'),
    getGuestName: () => 'Marina Costa',
    getGuestEmail: () => 'marina.costa@example.com',
    getIsGuest: () => false,
  } as unknown as Payment;

  // Mock das Inscriptions
  const mockInscriptions = [
    {
      getId: () => 'insc_987654',
      getResponsible: () => 'Marina Costa',
      getTotalValue: () => 259.9,
      getCreatedAt: () => new Date('2025-03-18T10:30:00Z'),
      getConfirmationCode: () => 'abc123-def456-ghi789',
    },
    {
      getId: () => 'insc_987655',
      getResponsible: () => 'João Silva',
      getTotalValue: () => 289.9,
      getCreatedAt: () => new Date('2025-03-18T11:30:00Z'),
      getConfirmationCode: () => 'jkl012-mno345-pqr678',
    },
    {
      getId: () => 'insc_987656',
      getResponsible: () => 'Ana Santos',
      getTotalValue: () => 239.9,
      getCreatedAt: () => new Date('2025-03-18T12:30:00Z'),
      getConfirmationCode: () => 'stu901-vwx234-yz567',
    },
  ] as unknown as Inscription[];

  // Mock das Allocations (alocações do pagamento)
  const mockAllocations = [
    {
      getId: () => 'alloc_001',
      getInscriptionId: () => 'insc_987654',
      getValue: () => 259.9,
      getCreatedAt: () => new Date('2025-03-18T10:30:00Z'),
      getPaymentId: () => 'pay_123456',
    },
    {
      getId: () => 'alloc_002',
      getInscriptionId: () => 'insc_987655',
      getValue: () => 289.9,
      getCreatedAt: () => new Date('2025-03-18T11:30:00Z'),
      getPaymentId: () => 'pay_123456',
    },
    {
      getId: () => 'alloc_003',
      getInscriptionId: () => 'insc_987656',
      getValue: () => 239.9,
      getCreatedAt: () => new Date('2025-03-18T12:30:00Z'),
      getPaymentId: () => 'pay_123456',
    },
  ] as unknown as PaymentAllocation[];

  return {
    event: mockEvent,
    payment: mockPayment,
    inscriptions: mockInscriptions,
    allocations: mockAllocations,
    actionUrl:
      process.env.FRONTEND_LOGIN_URL ?? 'https://portal.inscricao.dev/login',
    year: new Date().getFullYear(),
  };
};

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

const mockGuestInscriptionData = (): GuestInscriptionEmailData => ({
  eventName: 'Congresso de Tecnologia 2025',
  guestName: 'Marina Costa',
  guestEmail: 'marina.costa@example.com',
  accessUrl: 'https://inscricao.dev/guest/inscription/abc123',
  confirmationCode: 'abd1-casc-42ad',
});

const mockGuestExpiredData = (): GuestExpiredEmailData => ({
  eventName: 'Congresso de Tecnologia 2025',
  guestName: 'Marina Costa',
  guestEmail: 'marina.costa@example.com',
  registerUrl: 'https://inscricao.dev/guest/event_001',
});

const mockPaymentReviewNotificationData =
  (): PaymentReviewNotificationEmailData => ({
    paymentId: 'pay_123456',
    eventName: 'Congresso de Tecnologia 2025',
    eventLocation: 'São Paulo Expo, São Paulo - SP',
    eventStartDate: new Date('2025-04-05T08:00:00Z'),
    eventEndDate: new Date('2025-04-07T18:00:00Z'),
    paymentValue: 789.7,
    paymentDate: new Date('2025-03-18T10:30:00Z'),
    paymentMethod: 'PIX',
    accountUsername: 'tech-events-admin',
    inscriptions: [
      {
        inscriptionId: 'insc_987654',
        payerName: 'Marina Costa',
        payerEmail: 'marina.costa@example.com',
        payerPhone: '+55 (11) 91234-5678',
        totalValue: 259.9,
      },
      {
        inscriptionId: 'insc_987655',
        payerName: 'João Silva',
        payerEmail: 'joao.silva@example.com',
        payerPhone: '+55 (21) 99876-5432',
        totalValue: 289.9,
      },
      {
        inscriptionId: 'insc_987656',
        payerName: 'Ana Santos',
        payerEmail: 'ana.santos@example.com',
        payerPhone: '+55 (31) 98765-4321',
        totalValue: 239.9,
      },
    ],
  });

const mockPaymentProcessedNotificationData =
  (): PaymentProcessedNotificationEmailData => ({
    paymentId: 'pay_123456',
    name: 'Marina Costa',
    email: 'marina.costa@example.com',
    createdAt: new Date('2025-03-18T14:30:00Z'),
    value: 789.7,
    paymentMethod: PaymentMethod.PIX,
  });

const mockPaymentReceiptUpdateData = (): PaymentReceiptUpdateEmailData => ({
  paymentId: 'pay_123456',
  imageUrl: 'https://example.com/comprovante-atualizado.webp',
  eventName: 'Congresso de Tecnologia 2025',
});

const mockTicketReleaseData = (): TicketReleaseEmailData => ({
  buyerName: 'Carolina Dias',
  eventName: 'Congresso de Tecnologia 2025',
  totalTickets: 4,
  saleId: 'sale_ABC123',
});

const mockTicketSaleNotificationData = (): TicketSaleNotificationEmailData => ({
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

const mockInscriptionStatusData = (): InscriptionStatusEmailData => ({
  inscriptionId: 'insc_987654',
  responsibleName: 'Marina Costa',
  responsibleEmail: 'marina.costa@example.com',
  eventName: 'Congresso de Tecnologia 2025',
  eventLocation: 'São Paulo Expo, São Paulo - SP',
  decisionDate: new Date(),
});

export const templateDefinitions: TemplateDefinition[] = [
  {
    id: 'payment/payment-approved',
    category: 'payment',
    title: 'Pagamento aprovado',
    description: 'Confirmação de pagamento com lista de inscrições.',
    previewText: 'Pagamento aprovado com sucesso!',
    loader: async () => {
      const module = await import(
        '../templates/payment/payment-approved/index.js'
      );
      return { default: module.PaymentApprovedEmail };
    },
    getProps: () => mockPaymentApprovedData(),
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
      paymentData: mockPaymentApprovedData(),
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
    id: 'payment/payment-processed-notification',
    category: 'payment',
    title: 'Pagamento processado com sucesso',
    description:
      'Notifica o usuário que o pagamento foi processado com sucesso e aguarda aprovação.',
    previewText: 'Pagamento processado com sucesso!',
    loader: async () => {
      const module = await import(
        '../templates/payment/payment-processed/payment-processed-notification-email.template'
      );
      return { default: module.PaymentProcessedNotificationEmail };
    },
    getProps: () => ({
      paymentData: mockPaymentProcessedNotificationData(),
      actionUrl: 'https://portal.inscricao.dev/inscricao/insc_987654',
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'payment/payment-receipt-update',
    category: 'payment',
    title: 'Comprovante atualizado',
    description:
      'Alerta os responsáveis do evento quando um comprovante é atualizado.',
    previewText: 'O comprovante de pagamento foi atualizado.',
    loader: async () => {
      const module = await import(
        '../templates/payment/payment-receipt-update/index.js'
      );
      return { default: module.PaymentReceiptUpdateEmail };
    },
    getProps: () => ({
      paymentData: mockPaymentReceiptUpdateData(),
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
    id: 'inscription/status-approved',
    category: 'inscription',
    title: 'Inscrição aprovada',
    description: 'Confirma ao responsável que a inscrição foi aprovada.',
    previewText: 'Sua inscrição foi aprovada.',
    loader: async () => {
      const module = await import(
        '../templates/inscription/status-approved/index.js'
      );
      return { default: module.InscriptionStatusApprovedEmail };
    },
    getProps: () => ({
      statusData: mockInscriptionStatusData(),
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'inscription/status-rejected',
    category: 'inscription',
    title: 'Inscrição reprovada',
    description: 'Informa o responsável sobre a reprovação da inscrição.',
    previewText: 'Sua inscrição foi reprovada.',
    loader: async () => {
      const module = await import(
        '../templates/inscription/status-rejected/index.js'
      );
      return { default: module.InscriptionStatusRejectedEmail };
    },
    getProps: () => ({
      statusData: mockInscriptionStatusData(),
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'inscription/guest-registration',
    category: 'inscription',
    title: 'Inscrição guest registrada',
    description: 'Confirma ao convidado que a inscrição foi registrada.',
    previewText: 'Sua inscrição guest foi registrada.',
    loader: async () => {
      const module = await import(
        '../templates/inscription/guest-registration/index.js'
      );
      return { default: module.GuestInscriptionEmail };
    },
    getProps: () => ({
      guestData: mockGuestInscriptionData(),
      year: new Date().getFullYear(),
    }),
  },
  {
    id: 'inscription/guest-expired',
    category: 'inscription',
    title: 'Inscrição guest expirada',
    description: 'Notifica o convidado que o prazo de pagamento expirou.',
    previewText: 'Sua inscrição guest expirou.',
    loader: async () => {
      const module = await import(
        '../templates/inscription/guest-expired/index.js'
      );
      return { default: module.GuestExpiredEmail };
    },
    getProps: () => ({
      guestData: mockGuestExpiredData(),
      year: new Date().getFullYear(),
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
);

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
