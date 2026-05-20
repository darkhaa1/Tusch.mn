import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { VerifyEmailTemplate } from './templates/VerifyEmailTemplate';
import { PasswordResetTemplate } from './templates/PasswordResetTemplate';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Plain-text fallback for clients that don't render HTML. */
  text?: string;
  replyTo?: string;
  /** Optional Resend tags for analytics / filtering in the dashboard. */
  tags?: { name: string; value: string }[];
}

export interface EmailHealth {
  configured: boolean;
  fromEmail: string | null;
  fromName: string;
  domain: string | null;
}

/**
 * Thin wrapper around the Resend SDK. Two design rules drive the shape:
 *
 *   1. Never crash the app on misconfiguration or remote failure. If
 *      Resend is unreachable or returns an error, `send()` resolves to
 *      `null` and the caller decides whether the missing email is fatal.
 *   2. The high-level methods (sendEmailVerification etc.) live here as
 *      typed stubs so US-E2 can land templates without churn elsewhere.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string | null;
  private readonly fromName: string;
  private readonly frontendUrl: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.fromEmail = config.get<string>('RESEND_FROM_EMAIL') ?? null;
    this.fromName = config.get<string>('RESEND_FROM_NAME') ?? 'Tusch';
    this.frontendUrl = (
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');

    if (apiKey && this.fromEmail) {
      this.resend = new Resend(apiKey);
      this.logger.log(
        `Email service ready (from ${this.formatFrom()}).`,
      );
    } else {
      this.resend = null;
      this.logger.warn(
        'Email service disabled — RESEND_API_KEY / RESEND_FROM_EMAIL missing. ' +
          'Outgoing mail will be dropped silently.',
      );
    }
  }

  isEnabled(): boolean {
    return this.resend !== null;
  }

  /** Diagnostic snapshot exposed through GET /admin/email/health. */
  health(): EmailHealth {
    return {
      configured: this.isEnabled(),
      fromEmail: this.fromEmail,
      fromName: this.fromName,
      domain: this.fromEmail ? this.fromEmail.split('@')[1] ?? null : null,
    };
  }

  /**
   * Send a transactional email. Returns the Resend message id on success,
   * `null` when the service is disabled, and `null` after logging on any
   * SDK error — callers should treat both null cases the same.
   */
  async send(params: SendEmailParams): Promise<{ id: string } | null> {
    if (!this.resend || !this.fromEmail) {
      this.logger.warn(
        `[email-skipped] subject="${params.subject}" reason="not-configured"`,
      );
      return null;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.formatFrom(),
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo,
        tags: params.tags,
      });

      if (response.error) {
        this.logger.error(
          `[email-failed] subject="${params.subject}" error="${response.error.name}: ${response.error.message}"`,
        );
        return null;
      }

      const id = response.data?.id;
      if (!id) {
        this.logger.warn(
          `[email-sent] subject="${params.subject}" id=<missing-from-response>`,
        );
        return null;
      }

      this.logger.log(`[email-sent] subject="${params.subject}" id=${id}`);
      return { id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      this.logger.error(
        `[email-throw] subject="${params.subject}" error="${msg}"`,
      );
      return null;
    }
  }

  // ── High-level methods ───────────────────────────────────────────────

  /**
   * Send the "verify your email" message. The raw verification token is
   * embedded in the magic link; the API stores only its SHA-256 hash.
   */
  async sendEmailVerification(
    to: string,
    rawToken: string,
    userName: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;
    const html = await render(
      VerifyEmailTemplate({ userName, verificationUrl }),
    );
    const text =
      `Сайн байна уу, ${userName || 'Хэрэглэгч'}!\n\n` +
      `Tusch.mn-д тавтай морилно уу. Доорх холбоосыг хөтөч рүүгээ хуулж тавьж имэйлээ баталгаажуулна уу:\n` +
      `${verificationUrl}\n\n` +
      `Энэ холбоос 24 цагийн дотор дуусна.`;

    await this.send({
      to,
      subject: 'Имэйлээ баталгаажуулна уу',
      html,
      text,
      tags: [{ name: 'flow', value: 'email-verification' }],
    });
  }

  /**
   * Send the "reset your password" message. Same hashing model as the
   * verification flow — the raw token is in the link only.
   */
  async sendPasswordReset(
    to: string,
    rawToken: string,
    userName: string,
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    const html = await render(PasswordResetTemplate({ userName, resetUrl }));
    const text =
      `Сайн байна уу, ${userName || 'Хэрэглэгч'}!\n\n` +
      `Та Tusch.mn-д нууц үг сэргээх хүсэлт илгээсэн байна. Доорх холбоосыг хөтөч рүүгээ хуулж тавьж шинэ нууц үг үүсгэнэ үү:\n` +
      `${resetUrl}\n\n` +
      `Энэ холбоос 1 цагийн дотор дуусна.`;

    await this.send({
      to,
      subject: 'Нууц үг сэргээх',
      html,
      text,
      tags: [{ name: 'flow', value: 'password-reset' }],
    });
  }

  // ── Stubs landing in US-E3 ───────────────────────────────────────────

  async sendOfferNotification(
    _to: string,
    _offerId: string,
    _kind: 'accepted' | 'rejected' | 'completed',
    _locale: 'mn' | 'en' = 'mn',
  ): Promise<void> {
    throw new Error('Not implemented yet — US-E3');
  }

  async sendMessageNotification(
    _to: string,
    _senderName: string,
    _listingId: string,
    _locale: 'mn' | 'en' = 'mn',
  ): Promise<void> {
    throw new Error('Not implemented yet — US-E3');
  }

  private formatFrom(): string {
    return `${this.fromName} <${this.fromEmail}>`;
  }
}
