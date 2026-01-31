import { Button, Section, Text } from '@react-email/components';
import React from 'react';
import type { GuestInscriptionEmailData } from 'src/infra/services/mail/types/inscription/guest-inscription-email.types';
import { Layout } from '../../shared/Layout';

export type GuestInscriptionEmailProps = {
  guestData: GuestInscriptionEmailData;
  year?: number;
};

export const GuestInscriptionEmail = ({
  guestData,
  year,
}: GuestInscriptionEmailProps) => {
  return (
    <Layout
      previewText={`Inscrição registrada - ${guestData.eventName}`}
      year={year}
      headerTitle="Inscrição registrada com sucesso"
      headerSubtitle={`Olá, ${guestData.guestName}. Sua inscrição foi registrada e já pode ser acompanhada.`}
    >
      <Section style={cardStyle}>
        <Text style={titleStyle}>Acompanhe sua inscrição</Text>
        <Text style={bodyStyle}>
          Acesse o link abaixo para acompanhar o status da inscrição e realizar
          o pagamento quando disponível.
        </Text>
        <Section style={buttonWrapperStyle}>
          <Button href={guestData.accessUrl} style={buttonStyle}>
            Acessar inscrição
          </Button>
        </Section>
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

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#0f172a',
  margin: '0 0 18px 0',
  lineHeight: 1.5,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#4556d4',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 18px',
  textDecoration: 'none',
  display: 'inline-block',
};

const buttonWrapperStyle: React.CSSProperties = {
  textAlign: 'center',
};

export default GuestInscriptionEmail;
