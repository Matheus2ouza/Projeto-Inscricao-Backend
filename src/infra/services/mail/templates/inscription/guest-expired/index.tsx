import { Button, Section, Text } from '@react-email/components';
import React from 'react';
import type { GuestExpiredEmailData } from 'src/infra/services/mail/types/inscription/guest-expired-email.types';
import { Layout } from '../../shared/Layout';

export type GuestExpiredEmailProps = {
  guestData: GuestExpiredEmailData;
  year?: number;
};

export const GuestExpiredEmail = ({
  guestData,
  year,
}: GuestExpiredEmailProps) => {
  return (
    <Layout
      previewText={`Inscrição expirada - ${guestData.eventName}`}
      year={year}
      headerTitle={guestData.eventName.toUpperCase()}
      headerSubtitle={`Olá, ${guestData.guestName}.`}
    >
      <Section style={cardStyle}>
        <Text style={bodyStyle}>
          O prazo para o pagamento da sua inscrição expirou e, por esse motivo, ela foi excluída.
        </Text>
        <Text style={bodyStyle}>
          Mas não se preocupe! Você ainda pode acessar o sistema e realizar uma nova inscrição.
        </Text>
        <Text style={bodyStyle}>
          Clique no botão abaixo para fazer sua inscrição:
        </Text>
        <Section style={buttonWrapperStyle}>
          <Button href={guestData.registerUrl} style={buttonStyle}>
            Fazer minha inscrição
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

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#0f172a',
  margin: '0 0 18px 0',
  lineHeight: 1.5,
  textAlign: 'center',
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

export default GuestExpiredEmail;
