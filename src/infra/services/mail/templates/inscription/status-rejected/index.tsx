import { Section, Text } from '@react-email/components';
import React from 'react';
import type { InscriptionStatusEmailData } from '../../../types/inscription/inscription-status-email.types';
import { Layout } from '../../shared/Layout';

export type InscriptionStatusRejectedEmailProps = {
  statusData: InscriptionStatusEmailData;
  year?: number;
};

export const InscriptionStatusRejectedEmail = ({
  statusData,
  year,
}: InscriptionStatusRejectedEmailProps) => {
  return (
    <Layout
      previewText={`Inscrição reprovada para ${statusData.eventName}`}
      year={year}
      headerTitle="Infelizmente sua inscrição foi recusada"
      headerSubtitle={`Olá, ${statusData.responsibleName}. Sua inscrição não pôde ser aprovada neste momento.`}
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
          Infelizmente sua inscrição não foi aprovada pela administração. Para
          mais informações, entre em contato com o suporte.
        </Text>
      </Section>
    </Layout>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff1f2',
  border: '1px solid #fecdd3',
  borderRadius: '18px',
  padding: '24px 28px',
};

const eyebrowStyle: React.CSSProperties = {
  textTransform: 'uppercase',
  fontSize: '12px',
  fontWeight: 700,
  color: '#7f1d1d',
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
  backgroundColor: '#fecdd3',
  fontSize: '12px',
  fontWeight: 600,
  color: '#7f1d1d',
  borderBottom: '1px solid #fda4af',
};

const valueCellStyle: React.CSSProperties = {
  padding: '12px 14px',
  backgroundColor: '#fff',
  fontSize: '14px',
  color: '#311b22',
  borderBottom: '1px solid #f1f5f9',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#311b22',
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

export default InscriptionStatusRejectedEmail;
