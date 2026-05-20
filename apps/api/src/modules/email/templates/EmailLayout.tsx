import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

/**
 * Shared layout for every transactional email. Atelier palette is inlined
 * here because most email clients strip <style> blocks and ignore class
 * attributes. Keep colors and spacing as literal values.
 */
const PAPER = '#faf6ee';
const CREAM = '#f4ede1';
const INK = '#1a1714';
const TERRE = '#a8542a';
const MUTED = '#6b635a';

export interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="mn">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: PAPER,
          margin: 0,
          padding: '24px 12px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: INK,
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            maxWidth: '560px',
            margin: '0 auto',
            padding: '32px 32px 24px',
            borderRadius: '12px',
            border: `1px solid ${CREAM}`,
          }}
        >
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: INK,
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
              Tusch
            </Text>
          </Section>

          {children}

          <Hr
            style={{
              borderColor: CREAM,
              margin: '32px 0 16px',
            }}
          />
          <Section style={{ textAlign: 'center' }}>
            <Text
              style={{
                fontSize: '12px',
                color: MUTED,
                margin: '0 0 4px',
              }}
            >
              <Link
                href="https://tusch.mn"
                style={{ color: TERRE, textDecoration: 'none' }}
              >
                tusch.mn
              </Link>
              {' · '}
              <Link
                href="mailto:info@tusch.mn"
                style={{ color: TERRE, textDecoration: 'none' }}
              >
                info@tusch.mn
              </Link>
            </Text>
            <Text
              style={{
                fontSize: '11px',
                color: MUTED,
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} Tusch.mn
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const EMAIL_COLORS = { PAPER, CREAM, INK, TERRE, MUTED } as const;
