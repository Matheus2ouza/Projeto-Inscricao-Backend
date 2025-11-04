import { Button, Hr, Section, Text } from '@react-email/components';
import React from 'react';
import type { PaymentEmailData } from '../../../types/payment/payment-email.types';
import { Layout } from '../../shared/Layout';

export type PaymentRejectedEmailProps = {
  paymentData: PaymentEmailData;
  loginUrl: string;
  year?: number;
};

export const PaymentRejectedEmail = ({
  paymentData,
  loginUrl,
  year,
}: PaymentRejectedEmailProps) => {
  const summaryRows = [
    { label: 'Evento', value: formatField(paymentData.eventName) },
    { label: 'Responsável', value: formatField(paymentData.responsibleName) },
    { label: 'Telefone', value: formatField(paymentData.responsiblePhone) },
    {
      label: 'Data do pagamento',
      value: formatDateTime(paymentData.paymentDate),
    },
  ];

  const hasRejectionReason = Boolean(paymentData.rejectionReason);

  return (
    <Layout previewText="Pagamento reprovado" year={year}>
      <Section style={sectionSpacingStyle}>
        <div style={cardNegativeStyle}>
          <div style={statusPillDangerStyle}>Ação necessária</div>
          <div style={spacer14} />
          <Text style={headlineNegativeStyle}>Pagamento reprovado</Text>
          <Text style={bodyNegativeStyle}>
            Não foi possível concluir a confirmação do pagamento. Revise o
            porque se deu pagamento ter sido reprovado
          </Text>
          <div style={spacer18} />
          <Hr style={dividerNegativeStyle} />
          <div style={spacer18} />
          <Text style={eyebrowNegativeStyle}>Detalhes do pagamento</Text>
          <div style={tableWrapperStyle}>
            <table style={tableStyle} cellPadding={0} cellSpacing={0}>
              <tbody>
                {summaryRows.map((row, index) => {
                  const isLast = index === summaryRows.length - 1;
                  return (
                    <tr key={row.label}>
                      <td
                        style={{
                          ...labelCellNegativeStyle,
                          borderBottom: isLast
                            ? 'none'
                            : labelCellNegativeStyle.borderBottom,
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          ...valueCellNegativeStyle,
                          borderBottom: isLast
                            ? 'none'
                            : valueCellNegativeStyle.borderBottom,
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
        <div style={combinedCardStyle}>
          {hasRejectionReason && (
            <>
              <div style={reasonSectionStyle}>
                <Text style={reasonEyebrowStyle}>Motivo da rejeição</Text>
                <Text style={reasonTextStyle}>
                  {paymentData.rejectionReason}
                </Text>
              </div>
              <div style={dividerSpacerStyle} />
              <Hr style={internalDividerStyle} />
              <div style={dividerSpacerStyle} />
            </>
          )}
          <div style={valueSectionStyle}>
            <Text style={valueEyebrowStyle}>Valor não processado</Text>
            <Text style={amountNegativeStyle}>
              R$: {formatCurrency(paymentData.paymentValue)}
            </Text>
          </div>
        </div>
      </Section>

      <Section style={ctaSectionStyle}>
        <Button href={loginUrl} style={dangerButtonStyle}>
          Acessar minha conta
        </Button>
      </Section>

      <Section style={sectionSpacingStyle}>
        <div style={guidanceCardStyle}>
          <Text style={guidanceEyebrowStyle}>Como regularizar</Text>
          <Text style={guidanceBodyStyle}>
            &bull; Acesse sua conta no sistema;
            <br />
            &bull; Verifique o motivo da reprovação do seu pagamento;
            <br />
            &bull; Corrija as informações necessárias e realize um novo
            pagamento;
            <br />
            &bull; Aguarde a nova análise e aprovação por um administrador.
          </Text>
        </div>
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

const cardNegativeStyle: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '22px',
  border: '1px solid #fecaca',
  padding: '28px 28px 24px 28px',
};

const combinedCardStyle: React.CSSProperties = {
  backgroundColor: '#fff7ed',
  borderRadius: '22px',
  border: '1px solid #fed7aa',
  padding: '24px 28px',
};

const statusPillDangerStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 14px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  backgroundImage: 'linear-gradient(135deg, #f97316, #ef4444)',
  color: '#7f1d1d',
  boxShadow: '0 12px 26px rgba(239, 68, 68, 0.28)',
};

const spacer14: React.CSSProperties = {
  height: '14px',
};

const spacer18: React.CSSProperties = {
  height: '18px',
};

const dividerSpacerStyle: React.CSSProperties = {
  height: '12px',
};

const headlineNegativeStyle: React.CSSProperties = {
  color: '#7f1d1d',
  fontSize: '30px',
  fontWeight: 700,
  lineHeight: '1.2',
  margin: '0',
};

const bodyNegativeStyle: React.CSSProperties = {
  color: '#7f1d1d',
  margin: '12px 0 0 0',
  fontSize: '14px',
  lineHeight: '1.6',
};

const dividerNegativeStyle: React.CSSProperties = {
  margin: '0',
  borderColor: '#fecaca',
};

const internalDividerStyle: React.CSSProperties = {
  margin: '0',
  borderColor: '#fed7aa',
};

const eyebrowNegativeStyle: React.CSSProperties = {
  color: '#b91c1c',
  margin: '0 0 12px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const tableWrapperStyle: React.CSSProperties = {
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid #fecaca',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const labelCellNegativeStyle: React.CSSProperties = {
  width: '35%',
  padding: '12px 16px',
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  borderBottom: '1px solid #fecaca',
};

const valueCellNegativeStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#7f1d1d',
  fontSize: '13px',
  lineHeight: '1.6',
  borderBottom: '1px solid #fecaca',
};

const reasonSectionStyle: React.CSSProperties = {
  padding: '0',
};

const reasonEyebrowStyle: React.CSSProperties = {
  color: '#c2410c',
  margin: '0 0 10px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const reasonTextStyle: React.CSSProperties = {
  color: '#7f1d1d',
  fontSize: '15px',
  fontWeight: 600,
  margin: '0 0 10px 0',
  lineHeight: '1.6',
};

const valueSectionStyle: React.CSSProperties = {
  padding: '0',
};

const valueEyebrowStyle: React.CSSProperties = {
  color: '#c2410c',
  margin: '0 0 8px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const amountNegativeStyle: React.CSSProperties = {
  color: '#ea580c',
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

const guidanceCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '22px',
  border: '1px solid #fecaca',
  padding: '24px 28px',
};

const guidanceEyebrowStyle: React.CSSProperties = {
  color: '#dc2626',
  margin: '0 0 12px 0',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

const guidanceBodyStyle: React.CSSProperties = {
  color: '#475569',
  margin: 0,
  fontSize: '14px',
  lineHeight: '1.6',
};

const dangerButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '16px 32px',
  borderRadius: '16px',
  backgroundImage: 'linear-gradient(135deg, #fb7185, #ef4444)',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  boxShadow: '0 14px 28px rgba(239, 68, 68, 0.25)',
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
    }).format(value);
  } catch {
    return value.toString();
  }
};

export default PaymentRejectedEmail;
