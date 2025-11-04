import { Link, Section, Text } from '@react-email/components';
import React from 'react';

type FooterProps = {
  year: number;
};

export const Footer = ({ year }: FooterProps) => (
  <Section style={sectionStyle}>
    <Text style={primaryTextStyle}>
      Este e-mail foi enviado automaticamente pelo sistema de inscrições.
    </Text>
    <Text style={supportTextStyle}>
      Em caso de dúvidas, entre em contato com o suporte:{' '}
      <Link
        href="https://wa.me/5591992587483?text=Olá!%20Preciso%20de%20ajuda%20com%20o%20sistema%20de%20inscrições."
        style={linkStyle}
      >
        (91) 99258-7483
      </Link>
    </Text>
    <Text style={mutedTextStyle}>
      &copy; {year} Sistema de Inscrição. Todos os direitos reservados.
    </Text>
  </Section>
);

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#f8faff',
  padding: '20px 32px 24px 32px',
  textAlign: 'center' as const,
};

const primaryTextStyle: React.CSSProperties = {
  color: '#7b88a8',
  margin: '0 0 6px 0',
  fontSize: '12px',
};

const supportTextStyle: React.CSSProperties = {
  color: '#475569',
  margin: '0 0 6px 0',
  fontSize: '12px',
  fontWeight: 500,
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
  fontWeight: 600,
};

const mutedTextStyle: React.CSSProperties = {
  color: '#94a3b8',
  margin: 0,
  fontSize: '12px',
};

export default Footer;
