import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EmailLayout } from './EmailLayout';

/**
 * Shared shape for every transactional notification email. Centralising
 * the layout (greeting, heading, body lines, optional CTA, optional
 * footer note) keeps each per-event component down to ~20 lines and the
 * visual style identical across the whole product.
 */
export interface NotificationEmailProps {
  preview: string;
  heading: string;
  greeting: string;
  bodyLines: string[];
  cta?: { label: string; href: string };
  footerNote?: string;
}

export function NotificationEmail({
  preview,
  heading,
  greeting,
  bodyLines,
  cta,
  footerNote,
}: NotificationEmailProps) {
  return (
    <EmailLayout preview={preview}>
      <Heading
        as="h1"
        style={{
          fontSize: '22px',
          color: EMAIL_COLORS.INK,
          margin: '0 0 16px',
          fontWeight: 600,
        }}
      >
        {heading}
      </Heading>
      <Text style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 12px' }}>
        {greeting}
      </Text>
      {bodyLines.map((line, index) => (
        <Text
          key={index}
          style={{
            fontSize: '15px',
            lineHeight: '1.6',
            margin: index === bodyLines.length - 1 ? '0 0 24px' : '0 0 12px',
          }}
        >
          {line}
        </Text>
      ))}
      {cta && (
        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button
            href={cta.href}
            style={{
              backgroundColor: EMAIL_COLORS.TERRE,
              color: '#ffffff',
              padding: '12px 28px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {cta.label}
          </Button>
        </Section>
      )}
      {footerNote && (
        <Text
          style={{
            fontSize: '12px',
            color: EMAIL_COLORS.MUTED,
            margin: '24px 0 0',
            lineHeight: '1.5',
          }}
        >
          {footerNote}
        </Text>
      )}
    </EmailLayout>
  );
}
