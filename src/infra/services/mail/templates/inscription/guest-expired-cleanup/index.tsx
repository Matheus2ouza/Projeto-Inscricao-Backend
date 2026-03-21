import { Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from '../../shared/Layout';

export type GuestExpiredCleanupTemplateProps = {
  eventName: string;
  totalDeleted: number;
  year?: number;
};

export const GuestExpiredCleanupTemplate = ({
  eventName,
  totalDeleted,
  year,
}: GuestExpiredCleanupTemplateProps) => {
  const previewText = `Foram removidas ${totalDeleted} inscrições guest expiradas do evento ${eventName}.`;

  return (
    <Layout
      previewText={previewText}
      year={year}
      headerEyebrow="Sistema de Inscrição"
      headerTitle={eventName.toUpperCase()}
      headerSubtitle="Resumo da limpeza automática de inscrições guest expiradas"
    >
      <Section style={cardStyle}>
        <Text style={bodyStyle}>
          O sistema realizou uma limpeza automática das inscrições do tipo{' '}
          <strong>guest</strong> que estavam expiradas para este evento.
        </Text>
        <Text style={bodyStyle}>
          No total, foram removidas{' '}
          <strong>{totalDeleted}</strong> inscrições guest expiradas.
        </Text>
        <Text style={secondaryTextStyle}>
          {totalDeleted > 0
            ? 'Em anexo você encontra um PDF com a lista detalhada das inscrições removidas.'
            : 'Nenhuma inscrição guest expirada foi encontrada para remoção neste ciclo.'}
        </Text>
        <Text style={footerTextStyle}>
          Este é um e-mail automático. Em caso de dúvidas, acesse o painel
          administrativo do sistema de inscrições.
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

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#0f172a',
  margin: '0 0 14px 0',
  lineHeight: 1.5,
  textAlign: 'center',
};

const secondaryTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#4b5563',
  margin: '4px 0 12px 0',
  lineHeight: 1.5,
  textAlign: 'center',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '8px 0 0 0',
  lineHeight: 1.4,
  textAlign: 'center',
};

export default GuestExpiredCleanupTemplate;

