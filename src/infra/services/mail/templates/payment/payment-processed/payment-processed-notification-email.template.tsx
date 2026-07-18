import { Section, Text } from '@react-email/components';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import React from 'react';
import type { PaymentProcessedNotificationEmailTemplateData } from 'src/infra/services/mail/types/payment/payment-processed-notification-email.types';
import { Layout } from '../../shared/Layout';

export const PaymentProcessedNotificationEmail = ({
  eventName,
  paymentData,
  year,
  actionUrl,
}: PaymentProcessedNotificationEmailTemplateData) => {
  const formattedPaymentValue = formatCurrency(paymentData.value);
  const formattedPaymentDate = formatDate(paymentData.createdAt);
  const shortPaymentId = truncateId(paymentData.paymentId);

  return (
    <Layout
      previewText={`Pagamento processado com sucesso - ${eventName}`}
      headerTitle="Pagamento processado com sucesso!"
      year={year}
    >
      {/* Cabecalho de saudacao */}
      <Section style={sectionSpacingStyle}>
        <div style={iconContainerStyle}>
          <IconCircleCheckFilled size={60} color="#2563eb" stroke={2} />
        </div>
        <Text style={greetingStyle}>Olá {paymentData.name},</Text>
        <Text style={thanksStyle}>
          Agradecemos o seu <span style={highlightStyle}>pagamento</span>!
        </Text>
      </Section>

      <hr style={dividerStyle} />

      {/* Informacoes do pedido */}
      <Section style={sectionSpacingStyle}>
        <Text style={sectionTitleStyle}>INFORMAÇÃO DO SEU PAGAMENTO:</Text>

        <table style={infoTableStyle} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={infoCellStyle}>
                <Text style={infoFieldLabelStyle}>ID do pagamento:</Text>
                <Text style={infoFieldValueStyle}>{shortPaymentId}</Text>
              </td>
              <td style={infoCellStyle}>
                <Text style={infoFieldLabelStyle}>Email:</Text>
                <a
                  href={`mailto:${paymentData.email}`}
                  style={infoFieldLinkStyle}
                >
                  {paymentData.email}
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ ...infoCellStyle, paddingTop: '18px' }}>
                <Text style={infoFieldLabelStyle}>Data de registro:</Text>
                <Text style={infoFieldValueStyle}>{formattedPaymentDate}</Text>
              </td>
              <td style={{ ...infoCellStyle, paddingTop: '18px' }}>
                <Text style={infoFieldLabelStyle}>Método:</Text>
                <Text style={infoFieldValueStyle}>
                  {paymentData.paymentMethod}
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Tabela de itens */}
      <Section style={sectionSpacingStyle}>
        <Text style={sectionTitleStyle}>AQUI ESTÁ O SEU PAGAMENTO:</Text>

        <table style={itemsTableStyle} cellPadding={0} cellSpacing={0}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Inscrição:</th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' as const }}>
                Preço:
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tableCellStyle}>{paymentData.name}</td>
              <td style={{ ...tableCellStyle, textAlign: 'right' as const }}>
                {formattedPaymentValue}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* CTA */}
      {actionUrl && (
        <Section style={sectionSpacingStyle}>
          <div style={ctaContainerStyle}>
            <a href={actionUrl} style={buttonStyle}>
              Visualizar inscrição
            </a>
          </div>
        </Section>
      )}
    </Layout>
  );
};

// Estilos
const sectionSpacingStyle: React.CSSProperties = {
  padding: '0 0 24px 0',
};

const iconContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '8px',
};

const greetingStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#1f2533',
  margin: '0 0 6px 0',
  textAlign: 'center' as const,
};

const thanksStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#4f5b84',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const highlightStyle: React.CSSProperties = {
  backgroundColor: '#dbeafe',
  color: '#1e3a8a',
  padding: '1px 4px',
  borderRadius: '3px',
};

const dividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e2e7f5',
  margin: '0 0 24px 0',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#93a3c7',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 16px 0',
};

const infoTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const infoCellStyle: React.CSSProperties = {
  width: '50%',
  verticalAlign: 'top' as const,
  paddingRight: '12px',
};

const infoFieldLabelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#1f2533',
  margin: '0 0 4px 0',
};

const infoFieldValueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#4f5b84',
  margin: 0,
};

const infoFieldLinkStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#2563eb',
  textDecoration: 'underline',
};

const itemsTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '4px',
};

const tableHeaderStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#1f2533',
  textAlign: 'left' as const,
  padding: '10px 12px',
  backgroundColor: '#eff4fd',
};

const tableCellStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#1f2533',
  padding: '12px',
  borderBottom: '1px solid #eef2fa',
};

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

// Helpers
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (date: Date | string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));

const truncateId = (id: string, visibleChars = 8): string => {
  if (!id) return '';
  return id.length > visibleChars ? `${id.slice(0, visibleChars)}...` : id;
};

export default PaymentProcessedNotificationEmail;
