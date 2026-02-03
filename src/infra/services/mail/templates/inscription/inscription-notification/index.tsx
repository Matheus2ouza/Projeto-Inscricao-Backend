import { Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from '../../shared/Layout';
import type {
  EventResponsibleEmailData,
  InscriptionEmailData,
} from '../../../types/inscription/inscription-email.types';

export type InscriptionNotificationEmailProps = {
  eventData: InscriptionEmailData;
  responsibles: EventResponsibleEmailData[];
  year?: number;
  currentDate?: Date | string;
};

export const InscriptionNotificationEmail = ({
  eventData,
  responsibles,
  year,
  currentDate = new Date(),
}: InscriptionNotificationEmailProps) => {
  const formattedTotalValue = formatCurrency(eventData.totalValue);
  const formattedInscriptionDate = formatDate(eventData.inscriptionDate);
  const formattedInscriptionTime = formatTime(eventData.inscriptionDate);
  const formattedSendDate = formatDate(currentDate);
  const formattedEventPeriod = formatEventPeriod(
    eventData.eventStartDate,
    eventData.eventEndDate,
  );

  const responsibleRows = [
    { label: 'Nome', value: eventData.responsibleName },
    { label: 'Telefone', value: eventData.responsiblePhone },
  ];

  if (eventData.responsibleEmail) {
    responsibleRows.push({
      label: 'E-mail',
      value: eventData.responsibleEmail,
    });
  }

  const summaryRows = [
    {
      label: 'Qtd de Participantes',
      value: eventData.participantCount.toString(),
    },
    { label: 'Data da Inscrição', value: formattedInscriptionDate },
    { label: 'Hora da Inscrição', value: formattedInscriptionTime },
  ];

  if (eventData.accountUsername) {
    summaryRows.splice(1, 0, {
      label: 'Conta Responsável',
      value: eventData.accountUsername,
    });
  }

  return (
    <Layout
      previewText={`Nova inscrição - ${eventData.eventName}`}
      headerTitle="Nova inscrição registrada"
      headerSubtitle="O evento recebeu um novo registro de participação. Confira as informações consolidadas."
      year={year}
    >
      <Section style={sectionSpacingStyle}>
        <div style={highlightCardStyle}>
          <Text style={highlightLabelStyle}>Evento</Text>
          <Text style={highlightValueStyle}>{eventData.eventName}</Text>
          {formattedEventPeriod ? (
            <Text style={highlightMetaStyle}>{formattedEventPeriod}</Text>
          ) : null}
          {eventData.eventLocation ? (
            <Text style={highlightMetaStyle}>{eventData.eventLocation}</Text>
          ) : null}
        </div>
      </Section>

      <Section style={sectionSpacingStyle}>
        <div style={infoCardStyle}>
          <Text style={sectionTitleStyle}>Dados do responsável</Text>
          <table style={infoTableStyle} cellPadding={0} cellSpacing={0}>
            <tbody>
              {responsibleRows.map((row, index) => (
                <tr key={`${row.label}-${index}`}>
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
          <Text style={sectionTitleStyle}>Resumo da inscrição</Text>
          <table style={infoTableStyle} cellPadding={0} cellSpacing={0}>
            <tbody>
              {summaryRows.map((row, index) => (
                <tr key={`${row.label}-${index}`}>
                  <td style={infoLabelCellStyle}>{row.label}</td>
                  <td style={infoValueCellStyle}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section style={sectionSpacingStyle}>
        <div style={totalCardStyle}>
          <Text style={totalTitleStyle}>Valor total da inscrição</Text>
          <Text style={totalValueStyle}>{formattedTotalValue}</Text>
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
  backgroundColor: '#f3f6ff',
  border: '1px solid #dde3f4',
  borderRight: 'none',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#5d6a91',
};

const infoValueCellStyle: React.CSSProperties = {
  width: '55%',
  padding: '12px 16px',
  border: '1px solid #dde3f4',
  fontSize: '14px',
  color: '#1f2533',
  lineHeight: '1.6',
};

const totalCardStyle: React.CSSProperties = {
  background:
    'linear-gradient(120deg, rgba(239,244,255,0.95) 0%, rgba(228,235,255,0.95) 100%)',
  borderRadius: '18px',
  padding: '28px',
  border: '1px solid #d2dbff',
  textAlign: 'center' as const,
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
};

const totalTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#465ad6',
  margin: '0 0 12px 0',
};

const totalValueStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 700,
  color: '#2f4fd1',
  letterSpacing: '0.4px',
  margin: 0,
};

const responsiblesListStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  color: '#1f2533',
  fontSize: '14px',
  lineHeight: '1.6',
};

const responsibleItemStyle: React.CSSProperties = {
  marginBottom: '8px',
};

const footerMetaSectionStyle: React.CSSProperties = {
  padding: '0 0 12px 0',
  textAlign: 'center' as const,
};

const footerMetaTextStyle: React.CSSProperties = {
  color: '#6f7a98',
  fontSize: '12px',
  margin: 0,
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const toDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

const formatDate = (value: Date | string): string => {
  const date = toDate(value);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatTime = (value: Date | string): string => {
  const date = toDate(value);

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

const formatEventPeriod = (
  start: Date | string,
  end: Date | string,
): string => {
  if (!start || !end) {
    return '';
  }

  try {
    const startDate = toDate(start);
    const endDate = toDate(end);

    const startFormatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(startDate);

    const endFormatted = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(endDate);

    if (startFormatted === endFormatted) {
      return `Data do evento: ${startFormatted}`;
    }

    return `Período do evento: ${startFormatted} até ${endFormatted}`;
  } catch {
    return '';
  }
};

export default InscriptionNotificationEmail;
