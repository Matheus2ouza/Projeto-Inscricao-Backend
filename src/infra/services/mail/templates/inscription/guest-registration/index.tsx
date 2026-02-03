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
      headerTitle={guestData.eventName.toUpperCase()}
      headerSubtitle={`Olá, ${guestData.guestName}. Sua inscrição foi realizada com sucesso!`}
    >
      <Section style={cardStyle}>
        <Text style={bodyStyle}>
          Para acompanhar os detalhes da sua inscrição, visualizar informações e
          acompanhar o status, basta clicar no botão abaixo.
        </Text>
        <Text style={bodyStyle}>
          Caso precise acessar sua inscrição posteriormente, utilize o código de
          confirmação informado neste e-mail. Esse código é{' '}
          <strong>exclusivo</strong> e permite localizar sua inscrição sempre
          que necessário.
        </Text>
        <Section style={codeWrapperStyle}>
          <Text style={codeStyle}>{guestData.confirmationCode}</Text>
        </Section>
        <Text style={bodyStyle}>
          Clique no botão abaixo para acessar sua inscrição:
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

const codeWrapperStyle: React.CSSProperties = {
  backgroundColor: '#eef2ff',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '18px',
  textAlign: 'center',
};

const codeStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#4556d4',
  fontFamily: 'monospace',
  margin: 0,
  letterSpacing: '4px',
};

export default GuestInscriptionEmail;
