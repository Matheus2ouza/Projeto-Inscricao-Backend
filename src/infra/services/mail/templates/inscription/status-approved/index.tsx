import { Section, Text } from '@react-email/components';
import React from 'react';
import type { InscriptionStatusEmailData } from '../../../types/inscription/inscription-status-email.types';
import { Layout } from '../../shared/Layout';

export type InscriptionStatusApprovedEmailProps = {
  statusData: InscriptionStatusEmailData;
  year?: number;
};

export const InscriptionStatusApprovedEmail = ({
  statusData,
  year,
}: InscriptionStatusApprovedEmailProps) => {
  return (
    <Layout
      previewText={`Inscrição aprovada para ${statusData.eventName}`}
      year={year}
      headerTitle="Sua inscrição foi aprovada!"
      headerSubtitle={`Olá, ${statusData.responsibleName}. Sua inscrição agora está aguardando o pagamento.`}
    >
      <Section style={cardStyle}>
        <Text style={eyebrowStyle}>Detalhes da inscrição</Text>
        <table style={tableStyle} cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={labelCellStyle}>Evento</td>
              <td style={valueCellStyle}>{statusData.eventName}</td>
            </tr>
            {statusData.eventLocation ? (
              <tr>
                <td style={labelCellStyle}>Local</td>
                <td style={valueCellStyle}>{statusData.eventLocation}</td>
              </tr>
            ) : null}
            <tr>
              <td style={labelCellStyle}>Código da inscrição</td>
              <td style={valueCellStyle}>{statusData.inscriptionId}</td>
            </tr>
            <tr>
              <td style={labelCellStyle}>Atualizado em</td>
              <td style={valueCellStyle}>
                {formatDate(statusData.decisionDate)}
              </td>
            </tr>
          </tbody>
        </table>
        <Text style={bodyStyle}>
          Sua inscrição foi aprovada pela administração e o pagamento já pode
          ser realizado.
        </Text>
      </Section>
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
  marginBottom: '12px',
};

const labelCellStyle: React.CSSProperties = {
  width: '35%',
  padding: '12px 14px',
  backgroundColor: '#dcfce7',
  fontSize: '12px',
  fontWeight: 600,
  color: '#15803d',
  borderBottom: '1px solid #bbf7d0',
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

function formatDate(date: Date | string): string {
  const dt = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dt);
}

export default InscriptionStatusApprovedEmail;
