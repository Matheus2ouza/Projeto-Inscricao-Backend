import { Button, Section, Text } from '@react-email/components';
import React from 'react';
import type { TicketReleaseEmailData } from '../../../types/tickets/ticket-release-email.types';
import { Layout } from '../../shared/Layout';

export type TicketPreSaleApprovedEmailProps = {
  ticketData: TicketReleaseEmailData;
  downloadsUrl?: string;
  year?: number;
};

export const TicketPreSaleApprovedEmail = ({
  ticketData,
  downloadsUrl,
  year,
}: TicketPreSaleApprovedEmailProps) => {
  return (
    <Layout
      previewText="Tickets liberados para sua compra"
      year={year}
      headerTitle="Tickets liberados!"
      headerSubtitle={`Olá, ${ticketData.buyerName}. Seus tickets foram aprovados e seguem anexados.`}
    >
      <Section style={cardStyle}>
        <Text style={eyebrowStyle}>Detalhes da venda</Text>
        <table style={tableStyle} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={labelCellStyle}>Evento</td>
              <td style={valueCellStyle}>{ticketData.eventName}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Quantidade</td>
              <td style={valueCellStyle}>{ticketData.totalTickets}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Código da venda</td>
              <td style={valueCellStyle}>{ticketData.saleId}</td>
            </tr>
          </tbody>
        </table>
        <Text style={bodyStyle}>
          Você encontrará todos os tickets em PDF anexados a esta mensagem.
        </Text>
      </Section>

      {downloadsUrl ? (
        <Section style={ctaSectionStyle}>
          <Button href={downloadsUrl} style={primaryButtonStyle}>
            Acessar tickets
          </Button>
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
  marginBottom: '18px',
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
  margin: '8px 0 0 0',
  lineHeight: 1.5,
};

const ctaSectionStyle: React.CSSProperties = {
  padding: '16px 0 0',
  textAlign: 'center',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '999px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 26px',
  textDecoration: 'none',
  display: 'inline-block',
};

export default TicketPreSaleApprovedEmail;
