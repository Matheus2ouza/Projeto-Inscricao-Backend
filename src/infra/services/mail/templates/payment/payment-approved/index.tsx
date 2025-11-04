import { Button, Hr, Section, Text } from '@react-email/components';
import React from 'react';
import type { PaymentEmailData } from '../../../types/payment/payment-email.types';
import { Layout } from '../../shared/Layout';

export type PaymentApprovedEmailProps = {
  paymentData: PaymentEmailData;
  loginUrl: string;
  year?: number;
};

export const PaymentApprovedEmail = ({
  paymentData,
  loginUrl,
  year,
}: PaymentApprovedEmailProps) => {
  const summaryRows = [
    { label: 'Evento', value: formatField(paymentData.eventName) },
    { label: 'Responsável', value: formatField(paymentData.responsibleName) },
    { label: 'Telefone', value: formatField(paymentData.responsiblePhone) },
    {
      label: 'Data do pagamento',
      value: formatDateTime(paymentData.paymentDate),
    },
  ];

  return (
    <Layout previewText="Pagamento confirmado" year={year}>
      <Section style={sectionSpacingStyle}>
        <div style={cardPositiveStyle}>
          <div style={statusPillSuccessStyle}>Pagamento confirmado</div>
          <div style={spacer14} />
          <Text style={headlinePositiveStyle}>Pagamento aprovado!</Text>
          <Text style={bodyPositiveStyle}>
            Seu pagamento foi processado com sucesso e o valor já foi
            decrementado de sua inscrição
          </Text>
          <div style={spacer18} />
          <Hr style={dividerPositiveStyle} />
          <div style={spacer18} />
          <Text style={eyebrowPositiveStyle}>Resumo do pagamento</Text>
          <div style={tableWrapperStyle}>
            <table style={tableStyle} cellPadding={0} cellSpacing={0}>
              <tbody>
                {summaryRows.map((row, index) => {
                  const isLast = index === summaryRows.length - 1;
                  return (
                    <tr key={row.label}>
                      <td
                        style={{
                          ...labelCellPositiveStyle,
                          borderBottom: isLast
                            ? 'none'
                            : labelCellPositiveStyle.borderBottom,
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          ...valueCellPositiveStyle,
                          borderBottom: isLast
                            ? 'none'
                            : valueCellPositiveStyle.borderBottom,
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section style={sectionSpacingStyle}>
        <div style={valueCardPositiveStyle}>
          <Text style={eyebrowValueStyle}>Valor aprovado</Text>
          <Text style={amountPositiveStyle}>
            R$: {formatCurrency(paymentData.paymentValue)}
          </Text>
        </div>
      </Section>

      <Section style={ctaSectionStyle}>
        <Button href={loginUrl} style={primaryButtonStyle}>
          Acessar minha conta
        </Button>
      </Section>
    </Layout>
  );
};

const sectionSpacingStyle: React.CSSProperties = {
  padding: '0 0 22px 0',
};

const ctaSectionStyle: React.CSSProperties = {
  padding: '0 0 12px 0',
  textAlign: 'center',
};

const cardPositiveStyle: React.CSSProperties = {
  backgroundColor: '#ecfdf5',
  borderRadius: '22px',
  border: '1px solid #bbf7d0',
  padding: '28px 28px 24px 28px',
};

const valueCardPositiveStyle: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderRadius: '22px',
  border: '1px solid #bbf7d0',
  padding: '24px 28px',
};

const nextStepsCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '22px',
  border: '1px solid #dbe4f1',
  padding: '24px 28px',
};

const statusPillSuccessStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 14px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  backgroundImage: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
  color: '#022c22',
  boxShadow: '0 12px 26px rgba(14, 165, 233, 0.25)',
};

const headlinePositiveStyle: React.CSSProperties = {
  color: '#022c22',
  fontSize: '30px',
  fontWeight: 700,
  lineHeight: '1.2',
  margin: '0',
};

const bodyPositiveStyle: React.CSSProperties = {
  color: '#0f3f37',
  margin: '12px 0 0 0',
  fontSize: '14px',
  lineHeight: '1.6',
};

const spacer14: React.CSSProperties = {
  height: '14px',
};

const spacer18: React.CSSProperties = {
  height: '18px',
};

const dividerPositiveStyle: React.CSSProperties = {
  margin: '0',
  borderColor: '#bbf7d0',
};

const eyebrowPositiveStyle: React.CSSProperties = {
  color: '#047857',
  margin: '0 0 12px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const tableWrapperStyle: React.CSSProperties = {
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid #bbf7d0',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCellPositiveStyle: React.CSSProperties = {
  width: '35%',
  padding: '12px 16px',
  backgroundColor: '#dcfce7',
  color: '#047857',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  borderBottom: '1px solid #bbf7d0',
};

const valueCellPositiveStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#0f3f37',
  fontSize: '13px',
  lineHeight: '1.6',
  borderBottom: '1px solid #bbf7d0',
};

const eyebrowValueStyle: React.CSSProperties = {
  color: '#0f766e',
  margin: '0 0 8px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const amountPositiveStyle: React.CSSProperties = {
  color: '#047857',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.4px',
  margin: '0 0 12px 0',
};

const helperTextStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

const eyebrowNextStepsStyle: React.CSSProperties = {
  color: '#0284c7',
  margin: '0 0 12px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const bodyNextStepsStyle: React.CSSProperties = {
  color: '#475569',
  margin: 0,
  fontSize: '14px',
  lineHeight: '1.6',
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '16px 32px',
  borderRadius: '16px',
  backgroundImage: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.25)',
};

const formatField = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '—';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR');
  }

  return String(value);
};

const formatDateTime = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '—';
  }

  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === 'number' ? value : String(value));

  if (Number.isNaN(date.getTime())) {
    return formatField(value);
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatCurrency = (value: number | undefined): string => {
  if (typeof value !== 'number') {
    return formatField(value);
  }

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  } catch {
    return value.toString();
  }
};

export default PaymentApprovedEmail;
