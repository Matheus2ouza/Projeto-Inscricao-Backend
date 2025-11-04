import { Section, Text } from '@react-email/components';
import React from 'react';

type HeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export const Header = ({ eyebrow, title, subtitle }: HeaderProps) => (
  <Section style={sectionStyle}>
    <Text style={eyebrowStyle}>{eyebrow}</Text>
    <Text style={titleStyle}>{title}</Text>
    {subtitle ? <Text style={subtitleStyle}>{subtitle}</Text> : null}
  </Section>
);

const sectionStyle: React.CSSProperties = {
  backgroundColor: '#0284c7',
  padding: '30px 32px 22px 32px',
};

const eyebrowStyle: React.CSSProperties = {
  color: '#ffffff',
  margin: '0',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1.4px',
};

const titleStyle: React.CSSProperties = {
  color: '#ffffff',
  margin: '8px 0 6px 0',
  fontSize: '22px',
  fontWeight: 700,
  letterSpacing: '-0.2px',
};

const subtitleStyle: React.CSSProperties = {
  color: '#d5edff',
  margin: '0',
  fontSize: '14px',
  lineHeight: '1.5',
};

export default Header;
