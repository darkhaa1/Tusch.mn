import { Button, Heading, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EMAIL_COLORS, EmailLayout } from './EmailLayout';

export interface PasswordResetTemplateProps {
  userName: string;
  resetUrl: string;
}

export function PasswordResetTemplate({
  userName,
  resetUrl,
}: PasswordResetTemplateProps) {
  return (
    <EmailLayout preview="Нууц үг сэргээх — Tusch.mn">
      <Heading
        as="h1"
        style={{
          fontSize: '22px',
          color: EMAIL_COLORS.INK,
          margin: '0 0 16px',
          fontWeight: 600,
        }}
      >
        Нууц үг сэргээх
      </Heading>

      <Text style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 12px' }}>
        Сайн байна уу, {userName || 'Хэрэглэгч'}!
      </Text>
      <Text style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' }}>
        Та Tusch.mn-д нууц үг сэргээх хүсэлт илгээсэн байна. Доорх товч дээр
        дарж шинэ нууц үг үүсгэнэ үү.
      </Text>

      <Section style={{ textAlign: 'center', margin: '24px 0' }}>
        <Button
          href={resetUrl}
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
          Шинэ нууц үг үүсгэх
        </Button>
      </Section>

      <Text
        style={{
          fontSize: '13px',
          color: EMAIL_COLORS.MUTED,
          margin: '24px 0 8px',
          lineHeight: '1.5',
        }}
      >
        Энэ холбоос 1 цагийн дотор дуусна. Хэрэв товч ажиллахгүй бол энэ
        холбоосыг хөтөч рүүгээ хуулж тавина уу:
      </Text>
      <Text
        style={{
          fontSize: '12px',
          color: EMAIL_COLORS.TERRE,
          wordBreak: 'break-all',
          margin: '0 0 20px',
        }}
      >
        {resetUrl}
      </Text>

      <Text
        style={{
          fontSize: '12px',
          color: EMAIL_COLORS.MUTED,
          margin: 0,
          lineHeight: '1.5',
        }}
      >
        Хэрэв та хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.
        Таны нууц үг өөрчлөгдөхгүй.
      </Text>
    </EmailLayout>
  );
}
