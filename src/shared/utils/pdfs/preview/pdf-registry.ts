import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { TicketUnitCard } from '../tickets/ticket-units-pdf-generator.util';
import {
  TicketUnitsPdfData,
  TicketUnitsPdfGenerator,
} from '../tickets/ticket-units-pdf-generator.util';

export type PdfCategory = 'tickets';

export type PdfDefinition = {
  category: PdfCategory;
  name: string;
  title: string;
  description?: string;
  generate: () => Promise<Buffer>;
};

const testLogoPath = path.resolve(
  process.cwd(),
  'public',
  'img',
  'test-pdf',
  'test-logo.png',
);

function logPreview(message: string, payload?: unknown) {
  console.log(`[PDF PREVIEW] ${message}`, payload ?? '');
}

function loadTestLogo(): string {
  try {
    readFileSync(testLogoPath);
    logPreview('Logo de teste carregada com sucesso.', { path: testLogoPath });
    return testLogoPath;
  } catch (error) {
    logPreview('Falha ao carregar logo de teste. Usando fallback embutido.', {
      path: testLogoPath,
      error,
    });
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA00lEQVRYR+2WQQrCMBBA34xNgFaJN9Eq4SUa54LaFJLzu0vJgN69GqlHIwhJI3ip8kZb5l2akAvqslwD8CZrj3wI6htv4Sg6FC3YSr6JC6dVsUgk8ErgCmEe1/d4EfbeU1kBafvyfD2o5r+JcKClIJYy6llNRolOAUSG5J24iHU6ODXkIyBCsxceYEusXLQ3E8hSXoENbu5KkmM7XIZzZL4aag9C3kUBnToxVaM8c+R8o7Y84xgZgN8XAiCA1KrMHjGYCGHYQDb4w4dc03H+xpCnkfbBznb6YkBMEU/j27As87kVtP3gsMAAAAASUVORK5CYII=';
  }
}

const staticEvent = {
  name: 'Congresso Gênesis 2025',
  startDate: new Date('2025-09-20T18:00:00-03:00'),
  location: 'Belém - PA',
};

const sampleTickets: TicketUnitCard[] = [
  {
    ticketUnitId: 'unit-01',
    ticketName: 'Almoço Domingo',
    qrCode: 'ticket-preview-almoco-domingo-01',
  },
  {
    ticketUnitId: 'unit-02',
    ticketName: 'Almoço Domingo',
    qrCode: 'ticket-preview-almoco-domingo-02',
  },
  {
    ticketUnitId: 'unit-03',
    ticketName: 'Janta Domingo',
    qrCode: 'ticket-preview-janta-domingo-01',
  },
  {
    ticketUnitId: 'unit-04',
    ticketName: 'Janta Domingo',
    qrCode: 'ticket-preview-janta-domingo-02',
  },
  {
    ticketUnitId: 'unit-05',
    ticketName: 'Camiseta Exclusiva',
    qrCode: 'ticket-preview-camiseta-01',
  },
  {
    ticketUnitId: 'unit-06',
    ticketName: 'Camiseta Exclusiva',
    qrCode: 'ticket-preview-camiseta-02',
  },
];

export const pdfDefinitions: PdfDefinition[] = [
  {
    category: 'tickets',
    name: 'ticket-units',
    title: 'Liberação de Tickets (Pré-venda)',
    description:
      'Visualização do PDF enviado ao aprovar uma pré-venda com múltiplos tipos de ticket.',
    generate: async () => {
      const pdfData = await buildTicketPreviewData();
      return await TicketUnitsPdfGenerator.generateTicketUnitsPdf(pdfData);
    },
  },
];

export const categories = Array.from(
  new Set(pdfDefinitions.map((definition) => definition.category)),
);

export const pdfsByCategory = pdfDefinitions.reduce<
  Record<PdfCategory, PdfDefinition[]>
>(
  (acc, definition) => {
    acc[definition.category].push(definition);
    return acc;
  },
  { tickets: [] },
);

export const findPdfDefinition = (category: string, name: string) =>
  pdfDefinitions.find(
    (definition) =>
      definition.category === category && definition.name === name,
  );

async function buildTicketPreviewData(): Promise<TicketUnitsPdfData> {
  const logo = loadTestLogo();

  return {
    header: {
      title: staticEvent.name,
      titleDetail: formatEventDetail(),
      subtitle: 'Pré-visualização do PDF de liberação de tickets',
      image: logo,
    },
    saleInfo: {
      saleId: 'sale-preview-001',
      buyerName: 'Matheus Furtado',
      buyerEmail: 'matheus.furtado@example.com',
      buyerPhone: '(91) 99258-7483',
      totalTickets: sampleTickets.length,
      totalValue: 390,
    },
    tickets: sampleTickets,
  };
}

function formatEventDetail(): string | undefined {
  const pieces: string[] = [];
  if (staticEvent.startDate) {
    pieces.push(
      `Data: ${staticEvent.startDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}`,
    );
  }
  if (staticEvent.location) {
    pieces.push(`Local: ${staticEvent.location}`);
  }
  if (!pieces.length) {
    return undefined;
  }
  return pieces.join(' • ');
}
