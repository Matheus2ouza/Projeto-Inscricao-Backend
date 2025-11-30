import { Section, Text } from '@react-email/components';
import React from 'react';
import type { TicketSaleNotificationEmailData } from '../../../types/tickets/ticket-sale-notification-email.types';
import { Layout } from '../../shared/Layout';

export type TicketSaleNotificationEmailProps = {
  saleData: TicketSaleNotificationEmailData;
  year?: number;
  currentDate?: Date | string;
};

export const TicketSaleNotificationEmail = ({
  saleData,
  year,
  currentDate,
}: TicketSaleNotificationEmailProps) => {
  return (
    <Layout
      previewText={`Nova pré-venda registrada para ${saleData.eventName}`}
      year={year}
      headerTitle="Nova pré-venda registrada"
      headerSubtitle={`Uma nova venda foi enviada por ${saleData.buyerName}. Confira os detalhes abaixo.`}
    >
      <Section style={cardStyle}>
        <Text style={eyebrowStyle}>Informações do evento</Text>
        <table style={tableStyle} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={labelCellStyle}>Evento</td>
              <td style={valueCellStyle}>{saleData.eventName}</td>
            </tr>
            {saleData.eventLocation ? (
              <tr>
                <td style={labelCellStyle}>Local</td>
                <td style={valueCellStyle}>{saleData.eventLocation}</td>
              </tr>
            ) : null}
            {saleData.eventStartDate ? (
              <tr>
                <td style={labelCellStyle}>Período</td>
                <td style={valueCellStyle}>
                  {formatDateRange(
                    saleData.eventStartDate,
                    saleData.eventEndDate,
                  )}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Section>

      <Section style={cardStyle}>
        <Text style={eyebrowStyle}>Detalhes da venda</Text>
        <table style={tableStyle} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={labelCellStyle}>Código da venda</td>
              <td style={valueCellStyle}>{saleData.saleId}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Comprador</td>
              <td style={valueCellStyle}>{saleData.buyerName}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Contato</td>
              <td style={valueCellStyle}>
                {saleData.buyerEmail || 'não informado'}
                {saleData.buyerPhone ? ` • ${saleData.buyerPhone}` : ''}
              </td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Valor informado</td>
              <td style={valueCellStyle}>{formatCurrency(saleData.totalValue)}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Método de pagamento</td>
              <td style={valueCellStyle}>{saleData.paymentMethod}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Enviado em</td>
              <td style={valueCellStyle}>
                {formatDateTime(saleData.submittedAt)}
              </td>
            </tr>
          </tbody>
        </table>
        <Text style={bodyStyle}>
          Por favor, revise os dados e valide o pagamento diretamente no painel
          administrativo.
        </Text>
      </Section>

      {currentDate ? (
        <Section style={footerInfoStyle}>
          <Text style={footerInfoTextStyle}>
            Notificação gerada em {formatDateTime(currentDate)}
          </Text>
        </Section>
      ) : null}
    </Layout>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  border: '1px solid #dbeafe',
  borderRadius: '18px',
  padding: '24px 28px',
  marginBottom: '16px',
};

const eyebrowStyle: React.CSSProperties = {
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 16px 0',
  letterSpacing: '0.4px',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '12px',
  borderRadius: '12px',
  overflow: 'hidden',
};

const labelCellStyle: React.CSSProperties = {
  width: '35%',
  padding: '12px 14px',
  backgroundColor: '#e0f2fe',
  fontSize: '12px',
  fontWeight: 600,
  color: '#0369a1',
  borderBottom: '1px solid #bae6fd',
};

const valueCellStyle: React.CSSProperties = {
  padding: '12px 14px',
  backgroundColor: '#fff',
  fontSize: '14px',
  color: '#0f172a',
  borderBottom: '1px solid #f1f5f9',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#0f172a',
  margin: '4px 0 0 0',
  lineHeight: 1.5,
};

const footerInfoStyle: React.CSSProperties = {
  paddingTop: '12px',
  textAlign: 'center',
};

const footerInfoTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#475569',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDateTime(date: Date | string): string {
  const dt = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt);
}

function formatDateRange(start?: Date, end?: Date): string {
  if (!start) return '—';
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  if (!end) {
    return dateFormatter.format(start);
  }
  return `${dateFormatter.format(start)} até ${dateFormatter.format(end)}`;
}

export default TicketSaleNotificationEmail;
