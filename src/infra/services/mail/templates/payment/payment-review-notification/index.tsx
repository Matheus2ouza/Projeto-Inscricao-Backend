import { Section, Text } from '@react-email/components';
import React from 'react';
import type { PaymentReviewNotificationEmailTemplateData } from '../../../types/payment/payment-review-notification-email.types';
import { Layout } from '../../shared/Layout';

export const PaymentReviewNotificationEmail = ({
  paymentData,
  responsibles,
  year,
  currentDate = new Date(),
}: PaymentReviewNotificationEmailTemplateData) => {
  const formattedPaymentValue = formatCurrency(paymentData.paymentValue);
  const formattedPaymentDate = formatDate(paymentData.paymentDate);
  const formattedPaymentTime = formatTime(paymentData.paymentDate);
  const formattedEventPeriod = formatEventPeriod(
    paymentData.eventStartDate,
    paymentData.eventEndDate,
  );
  const formattedSendDate = formatDate(currentDate);

  const paymentRows = [
    { label: 'Código do pagamento', value: paymentData.paymentId },
    { label: 'Data do envio', value: formattedPaymentDate },
    { label: 'Hora do envio', value: formattedPaymentTime },
    { label: 'Valor registrado', value: formattedPaymentValue },
    { label: 'Método de pagamento', value: paymentData.paymentMethod },
  ];

  if (paymentData.accountUsername) {
    paymentRows.push({
      label: 'Conta que enviou',
      value: paymentData.accountUsername,
    });
  }

  return (
    <Layout
      previewText={`Novo pagamento em análise - ${paymentData.eventName}`}
      headerTitle="Um novo pagamento precisa ser analisado"
      headerSubtitle="Confira os dados enviados pelo responsável para agilizar a conferência."
      year={year}
    >
      <Section style={sectionSpacingStyle}>
        <div style={highlightCardStyle}>
          <Text style={highlightLabelStyle}>Evento</Text>
          <Text style={highlightValueStyle}>{paymentData.eventName}</Text>
          {formattedEventPeriod ? (
            <Text style={highlightMetaStyle}>{formattedEventPeriod}</Text>
          ) : null}
          {paymentData.eventLocation ? (
            <Text style={highlightMetaStyle}>{paymentData.eventLocation}</Text>
          ) : null}
        </div>
      </Section>

      <Section style={sectionSpacingStyle}>
        <div style={infoCardStyle}>
          <Text style={sectionTitleStyle}>Resumo do pagamento</Text>
          <table style={infoTableStyle} cellPadding={0} cellSpacing={0}>
            <tbody>
              {paymentRows.map((row) => (
                <tr key={row.label}>
                  <td style={infoLabelCellStyle}>{row.label}</td>
                  <td style={infoValueCellStyle}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section style={sectionSpacingStyle}>
        <div style={infoCardStyle}>
          <Text style={sectionTitleStyle}>Inscrições associadas</Text>
          {paymentData.inscriptions.map((inscription, index) => (
            <div key={inscription.inscriptionId} style={inscriptionCardStyle}>
              <Text style={inscriptionTitleStyle}>
                Inscrição {index + 1} - {inscription.inscriptionId}
              </Text>
              <table style={infoTableStyle} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td style={infoLabelCellStyle}>Responsável</td>
                    <td style={infoValueCellStyle}>{inscription.payerName}</td>
                  </tr>
                  {inscription.payerEmail && (
                    <tr>
                      <td style={infoLabelCellStyle}>E-mail</td>
                      <td style={infoValueCellStyle}>
                        {inscription.payerEmail}
                      </td>
                    </tr>
                  )}
                  {inscription.payerPhone && (
                    <tr>
                      <td style={infoLabelCellStyle}>Telefone</td>
                      <td style={infoValueCellStyle}>
                        {inscription.payerPhone}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={infoLabelCellStyle}>Valor da inscrição</td>
                    <td style={infoValueCellStyle}>
                      {formatCurrency(inscription.totalValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Section>

      {responsibles.length > 1 ? (
        <Section style={sectionSpacingStyle}>
          <div style={infoCardStyle}>
            <Text style={sectionTitleStyle}>Responsáveis cadastrados</Text>
            <ul style={responsiblesListStyle}>
              {responsibles.map((responsible) => (
                <li key={responsible.id} style={responsibleItemStyle}>
                  <strong>{responsible.username}</strong>
                  {responsible.email ? ` - ${responsible.email}` : ''}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <Section style={footerMetaSectionStyle}>
        <Text style={footerMetaTextStyle}>
          Este aviso foi enviado em {formattedSendDate} pelo Sistema de
          Inscrição.
        </Text>
      </Section>
    </Layout>
  );
};

const sectionSpacingStyle: React.CSSProperties = {
  padding: '0 0 22px 0',
};

const highlightCardStyle: React.CSSProperties = {
  background:
    'linear-gradient(135deg, rgba(69,86,212,0.1) 0%, rgba(127,83,198,0.12) 100%)',
  border: '1px solid #d2dbff',
  borderRadius: '18px',
  padding: '24px 28px',
  textAlign: 'left' as const,
  boxShadow: '0 12px 28px rgba(36, 54, 94, 0.12)',
};

const highlightLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: '#4556d4',
  margin: '0 0 6px 0',
};

const highlightValueStyle: React.CSSProperties = {
  fontSize: '22px',
  color: '#1f2533',
  fontWeight: 700,
  margin: '0 0 10px 0',
  letterSpacing: '0.3px',
};

const highlightMetaStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#4f5b84',
  margin: '4px 0 0 0',
  lineHeight: '1.6',
};

const infoCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e2e7f5',
  padding: '24px 24px',
  boxShadow: '0 8px 22px rgba(55, 81, 126, 0.08)',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 18px 0',
  fontSize: '18px',
  color: '#4556d4',
  letterSpacing: '0.3px',
  fontWeight: 600,
};

const infoTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate' as const,
  borderSpacing: '0',
};

const infoLabelCellStyle: React.CSSProperties = {
  width: '45%',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#5b6382',
  fontWeight: 600,
  borderBottom: '1px solid #eef1fb',
};

const infoValueCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: '#1f2533',
  borderBottom: '1px solid #eef1fb',
};

const responsiblesListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const responsibleItemStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#1f2533',
  padding: '6px 0',
  borderBottom: '1px solid #eef1fb',
};

const footerMetaSectionStyle: React.CSSProperties = {
  padding: '18px 0 0 0',
};

const footerMetaTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#7c86a7',
  textAlign: 'center' as const,
};

const inscriptionCardStyle: React.CSSProperties = {
  backgroundColor: '#f8faff',
  border: '1px solid #e2e7f5',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
};

const inscriptionTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#4556d4',
  margin: '0 0 12px 0',
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (date: Date | string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

const formatTime = (date: Date | string): string =>
  new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const formatEventPeriod = (start?: Date, end?: Date): string | undefined => {
  if (!start || !end) {
    return undefined;
  }

  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);

  if (formattedStart === formattedEnd) {
    return formattedStart;
  }

  return `${formattedStart} até ${formattedEnd}`;
};

export default PaymentReviewNotificationEmail;
