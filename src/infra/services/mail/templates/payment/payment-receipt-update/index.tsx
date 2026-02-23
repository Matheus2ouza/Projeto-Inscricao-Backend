import { Button, Section, Text } from '@react-email/components';
import React from 'react';
import type { PaymentReceiptUpdateEmailTemplateData } from '../../../types/payment/payment-receipt-update-email.types';
import { Layout } from '../../shared/Layout';

export const PaymentReceiptUpdateEmail = ({
  paymentData,
  year,
  currentDate = new Date(),
}: PaymentReceiptUpdateEmailTemplateData) => {
  const formattedDate = formatDate(currentDate);

  return (
    <Layout
      previewText={`Comprovante atualizado - ${paymentData.eventName}`}
      headerTitle="Comprovante de pagamento atualizado"
      headerSubtitle="Um responsável atualizou o comprovante enviado. Confira o novo arquivo para seguir com a análise."
      year={year}
    >
      <Section style={sectionStyle}>
        <div style={cardStyle}>
          <Text style={headlineStyle}>
            Um comprovante foi atualizado no evento "{paymentData.eventName}"
          </Text>
          <Text style={bodyStyle}>
            Data do aviso: <strong>{formattedDate}</strong>
          </Text>
          <Text style={bodyStyle}>
            Código do pagamento: <strong>{paymentData.paymentId}</strong>
          </Text>
          <div style={buttonWrapperStyle}>
            <Button href={paymentData.imageUrl} style={buttonStyle}>
              Ver comprovante atualizado
            </Button>
          </div>
          <Text style={hintStyle}>
            Se o botão não abrir, copie e cole este link no navegador:
          </Text>
          <Text style={linkStyle}>{paymentData.imageUrl}</Text>
        </div>
      </Section>
    </Layout>
  );
};

const formatDate = (value: Date | string) => {
  const date = typeof value === 'string' ? new Date(value) : value;
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

const sectionStyle: React.CSSProperties = {
  padding: '12px 0',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#f7fafc',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  padding: '18px',
};

const headlineStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '18px',
  lineHeight: '26px',
  fontWeight: 700,
  color: '#0f172a',
};

const bodyStyle: React.CSSProperties = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  lineHeight: '22px',
  color: '#334155',
};

const buttonWrapperStyle: React.CSSProperties = {
  marginTop: '14px',
  marginBottom: '14px',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderRadius: '10px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  display: 'inline-block',
};

const hintStyle: React.CSSProperties = {
  margin: '0 0 6px 0',
  fontSize: '12px',
  lineHeight: '18px',
  color: '#475569',
};

const linkStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  lineHeight: '18px',
  color: '#1d4ed8',
  wordBreak: 'break-all',
};

export default PaymentReceiptUpdateEmail;
