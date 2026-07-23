import { Section, Text } from '@react-email/components';
import { IconCircleCheckFilled } from '@tabler/icons-react';
import React from 'react';
import { Event } from 'src/domain/entities/event/event.entity';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { Layout } from '../../shared/Layout';

export type PaymentApprovedEmailProps = {
  event: Event;
  payment: Payment;
  inscriptions: Inscription[]; // Inscrições para referência
  allocations: PaymentAllocation[]; // Alocações com os valores
  actionUrl: string;
  year?: number;
};

export const PaymentApprovedEmail = ({
  event,
  payment,
  inscriptions,
  allocations,
  actionUrl,
  year,
}: PaymentApprovedEmailProps) => {
  const formattedPaymentValue = formatCurrency(payment.getTotalValue());
  const formattedPaymentDate = formatDateTime(payment.getCreatedAt());

  // Calcular total das alocações para verificação
  const totalFromAllocations = allocations.reduce(
    (sum, allocation) => sum + allocation.getValue(),
    0,
  );

  return (
    <Layout
      previewText={`Pagamento aprovado - ${event.getName()}`}
      headerTitle="Pagamento aprovado com sucesso!"
      year={year}
    >
      {/* Cabecalho de saudacao */}
      <Section style={sectionSpacingStyle}>
        <div style={iconContainerStyle}>
          <IconCircleCheckFilled size={60} color="#16a34a" stroke={2} />
        </div>
        <Text style={greetingStyle}>Olá {payment.getGuestName()},</Text>
        <Text style={thanksStyle}>
          Seu pagamento foi <span style={highlightStyle}>aprovado</span>!
        </Text>
      </Section>

      <hr style={dividerStyle} />

      {/* Informacoes do pagamento */}
      <Section style={sectionSpacingStyle}>
        <Text style={sectionTitleStyle}>INFORMAÇÃO DO SEU PAGAMENTO:</Text>

        <table style={infoTableStyle} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={infoCellStyle}>
                <Text style={infoFieldLabelStyle}>Evento:</Text>
                <Text style={infoFieldValueStyle}>{event.getName()}</Text>
              </td>
              <td style={infoCellStyle}>
                <Text style={infoFieldLabelStyle}>Responsável:</Text>
                <Text style={infoFieldValueStyle}>
                  {payment.getGuestName()}
                </Text>
              </td>
            </tr>
            <tr>
              <td style={{ ...infoCellStyle, paddingTop: '18px' }}>
                <Text style={infoFieldLabelStyle}>Aprovado em:</Text>
                <Text style={infoFieldValueStyle}>{formattedPaymentDate}</Text>
              </td>
              <td style={{ ...infoCellStyle, paddingTop: '18px' }}>
                <Text style={infoFieldLabelStyle}>Status:</Text>
                <Text style={{ ...infoFieldValueStyle, color: '#16a34a' }}>
                  APROVADO
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
              <th style={{ ...tableHeaderStyle, textAlign: 'center' as const }}>
                Data:
              </th>
              <th style={{ ...tableHeaderStyle, textAlign: 'right' as const }}>
                Valor:
              </th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation, index) => {
              const isLast = index === allocations.length - 1;
              // Buscar a inscrição correspondente para obter o nome do responsável
              const inscription = inscriptions.find(
                (ins) => ins.getId() === allocation.getInscriptionId(),
              );
              const responsibleName = inscription?.getResponsible() || 'N/A';
              const createdAt = allocation.getCreatedAt() || new Date();

              return (
                <tr key={allocation.getId()}>
                  <td
                    style={{
                      ...tableCellStyle,
                      borderBottom: isLast
                        ? 'none'
                        : tableCellStyle.borderBottom,
                    }}
                  >
                    {responsibleName}
                  </td>
                  <td
                    style={{
                      ...tableCellStyle,
                      textAlign: 'center' as const,
                      borderBottom: isLast
                        ? 'none'
                        : tableCellStyle.borderBottom,
                    }}
                  >
                    {formatShortDate(createdAt)}
                  </td>
                  <td
                    style={{
                      ...tableCellStyle,
                      textAlign: 'right' as const,
                      borderBottom: isLast
                        ? 'none'
                        : tableCellStyle.borderBottom,
                    }}
                  >
                    {formatCurrency(allocation.getValue())}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Total */}
          <tfoot>
            <tr>
              <td colSpan={2} style={footerTotalLabelStyle}>
                TOTAL
              </td>
              <td style={footerTotalValueStyle}>{formattedPaymentValue}</td>
            </tr>
          </tfoot>
        </table>
      </Section>

      {/* CTA */}
      {actionUrl && (
        <Section style={sectionSpacingStyle}>
          <div style={ctaContainerStyle}>
            <a href={actionUrl} style={buttonStyle}>
              {payment.getIsGuest()
                ? 'Visualizar minha inscrição'
                : 'Acessar minha conta'}
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
  backgroundColor: '#dcfce7',
  color: '#166534',
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

const footerTotalLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#1f2533',
  padding: '12px',
  textAlign: 'right' as const,
  borderTop: '2px solid #1f2533',
};

const footerTotalValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#16a34a',
  padding: '12px',
  textAlign: 'right' as const,
  borderTop: '2px solid #1f2533',
};

const ctaContainerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#16a34a',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

// Helpers
const formatCurrency = (value: number | undefined): string => {
  if (typeof value !== 'number') return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDateTime = (value: unknown): string => {
  if (value === undefined || value === null) return '—';
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatShortDate = (value: unknown): string => {
  if (value === undefined || value === null) return '—';
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export default PaymentApprovedEmail;
