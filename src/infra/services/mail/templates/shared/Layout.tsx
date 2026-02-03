import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
} from '@react-email/components';
import type { ReactNode } from 'react';
import React from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

export type LayoutProps = {
  previewText?: string;
  year?: number;
  headerEyebrow?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  children: ReactNode;
  eventImageUrl?: string;
  eventLocation?: string;
  eventDate?: string;
};

export const Layout = ({
  previewText = 'Sistema de Inscrição',
  year = new Date().getFullYear(),
  headerEyebrow = 'Sistema de Inscrição',
  headerTitle = 'Sistema de Inscrição',
  headerSubtitle = 'Notificação automática do portal de inscrições',
  children,
}: LayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Section style={wrapperSectionStyle}>
          <Container style={containerStyle}>
            <Header
              eyebrow={headerEyebrow}
              title={headerTitle}
              subtitle={headerSubtitle}
            />

            <Section style={dividerSectionStyle}>
              <Hr style={dividerStyle} />
            </Section>

            <Section style={contentSectionStyle}>{children}</Section>

            <Footer year={year} />
          </Container>
        </Section>
      </Body>
    </Html>
  );
};

const bodyStyle: React.CSSProperties = {
  margin: '0',
  padding: '0',
  width: '100%',
  backgroundColor: '#f3f6fd',
  fontFamily: 'Open Sans, Arial, sans-serif',
};

const wrapperSectionStyle: React.CSSProperties = {
  padding: '40px 16px',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '640px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '18px',
  border: '1px solid #dbe4f1',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden',
};

const dividerSectionStyle: React.CSSProperties = {
  padding: '0 32px',
};

const dividerStyle: React.CSSProperties = {
  borderColor: '#e5ecfa',
  margin: '0',
};

const contentSectionStyle: React.CSSProperties = {
  padding: '24px 32px 6px 32px',
};

export default Layout;
