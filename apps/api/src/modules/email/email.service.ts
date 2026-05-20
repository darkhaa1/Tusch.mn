import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import {
  type EmailNotificationKey,
  getUserEmailPref,
} from '@repo/shared';
import { PrismaService } from '../../database/prisma.service';
import { VerifyEmailTemplate } from './templates/VerifyEmailTemplate';
import { PasswordResetTemplate } from './templates/PasswordResetTemplate';
import { NotificationEmail } from './templates/NotificationEmail';

/**
 * Minimal user shape a notification email needs. Mirrors a subset of the
 * Prisma User model so callers can pass the model directly without
 * remapping fields.
 */
export interface NotificationRecipient {
  email: string | null;
  emailVerified: boolean;
  firstName: string;
  emailNotifications: unknown;
}

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

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
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

  // ── US-E3: per-event notification emails ─────────────────────────────
  //
  // Each method gates on three conditions before doing anything:
  //   1. Service is configured (Resend key + verified domain).
  //   2. The recipient has a verified email — sending to unverified
  //      addresses tanks deliverability and risks bounces.
  //   3. The user has not opted out of this notification kind.
  // Errors never leak to the caller; business flows continue regardless.

  async sendNewMessageEmail(
    to: NotificationRecipient,
    params: {
      fromUserName: string;
      preview: string;
      conversationUrl: string;
    },
  ): Promise<void> {
    await this.sendNotification(to, 'newMessage', {
      subject: `Шинэ зурвас — ${params.fromUserName}`,
      previewLine: `Та ${params.fromUserName}-ээс зурвас хүлээн авлаа.`,
      heading: 'Шинэ зурвас',
      bodyLines: [
        `Та ${params.fromUserName}-ээс шинэ зурвас хүлээн авлаа.`,
        `"${truncate(params.preview, 50)}"`,
      ],
      cta: { label: 'Зурвас үзэх', href: params.conversationUrl },
    });
  }

  async sendNewOfferEmail(
    to: NotificationRecipient,
    params: {
      providerName: string;
      listingTitle: string;
      offerAmount: number;
      offerUrl: string;
    },
  ): Promise<void> {
    await this.sendNotification(to, 'newOffer', {
      subject: `Шинэ санал ирлээ — ${params.listingTitle}`,
      previewLine: `${params.providerName} таны зар дээр санал ирүүлсэн.`,
      heading: 'Шинэ санал',
      bodyLines: [
        `${params.providerName} таны "${params.listingTitle}" зар дээр санал ирүүлсэн.`,
        `Үнэ: ${formatMnt(params.offerAmount)}`,
      ],
      cta: { label: 'Саналыг харах', href: params.offerUrl },
    });
  }

  async sendOfferAcceptedEmail(
    to: NotificationRecipient,
    params: { clientName: string; listingTitle: string; offerUrl: string },
  ): Promise<void> {
    await this.sendNotification(to, 'offerAccepted', {
      subject: 'Таны санал хүлээн авагдлаа',
      previewLine: `${params.clientName} таны санлыг хүлээн авлаа.`,
      heading: 'Таны санал хүлээн авагдлаа 🎉',
      bodyLines: [
        `${params.clientName} таны "${params.listingTitle}" зар дээрх санлыг хүлээн авлаа.`,
        'Та одоо захиалагчтай шууд харилцаж эхлэх боломжтой.',
      ],
      cta: { label: 'Дэлгэрэнгүй', href: params.offerUrl },
    });
  }

  async sendOfferRejectedEmail(
    to: NotificationRecipient,
    params: { listingTitle: string },
  ): Promise<void> {
    await this.sendNotification(to, 'offerRejected', {
      subject: 'Санал хүлээн авагдсангүй',
      previewLine: `Таны "${params.listingTitle}" зар дээрх санлыг хүлээн аваагүй.`,
      heading: 'Санал хүлээн авагдсангүй',
      bodyLines: [
        `Таны "${params.listingTitle}" зар дээрх санлыг харгалзах захиалагч хүлээн аваагүй.`,
        'Та өөр заруудаас санал тавьж үзээрэй.',
      ],
    });
  }

  async sendOfferCompletedEmail(
    to: NotificationRecipient,
    params: {
      otherPartyName: string;
      listingTitle: string;
      reviewUrl: string;
    },
  ): Promise<void> {
    await this.sendNotification(to, 'offerCompleted', {
      subject: 'Үйлчилгээ дууссан — сэтгэгдэл үлдээнэ үү',
      previewLine: `Та ${params.otherPartyName}-тэй хийсэн ажил дуусгалаа.`,
      heading: 'Үйлчилгээ дууслаа',
      bodyLines: [
        `Та ${params.otherPartyName}-тэй "${params.listingTitle}" дээрх ажлыг амжилттай дуусгалаа.`,
        'Туршлагаа хуваалцаж сэтгэгдэл үлдээнэ үү.',
      ],
      cta: { label: 'Сэтгэгдэл үлдээх', href: params.reviewUrl },
    });
  }

  async sendNewReviewEmail(
    to: NotificationRecipient,
    params: {
      fromUserName: string;
      rating: number;
      commentSnippet: string;
      profileUrl: string;
    },
  ): Promise<void> {
    await this.sendNotification(to, 'newReview', {
      subject: `Шинэ сэтгэгдэл — ${params.rating}★`,
      previewLine: `${params.fromUserName} танд ${params.rating} оддын үнэлгээ өгсөн.`,
      heading: 'Шинэ сэтгэгдэл',
      bodyLines: [
        `${params.fromUserName} танд ${params.rating} оддын үнэлгээ өгсөн.`,
        `"${truncate(params.commentSnippet, 50)}"`,
      ],
      cta: { label: 'Профайл үзэх', href: params.profileUrl },
    });
  }

  /**
   * Fire-and-forget helper for call sites that only know the recipient
   * id. Looks up just the fields needed for gating, runs `sender`, and
   * swallows every error so the business path is never blocked.
   */
  dispatchToUserId(
    userId: string,
    sender: (recipient: NotificationRecipient) => Promise<void>,
  ): void {
    void this.prisma.user
      .findUnique({
        where: { id: userId },
        select: {
          email: true,
          emailVerified: true,
          firstName: true,
          emailNotifications: true,
        },
      })
      .then((recipient) => (recipient ? sender(recipient) : undefined))
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'unknown';
        this.logger.warn(`[dispatchToUserId(${userId})] failed: ${msg}`);
      });
  }

  /**
   * Shared rendering + gating path for every notification email.
   */
  private async sendNotification(
    to: NotificationRecipient,
    prefKey: EmailNotificationKey,
    params: {
      subject: string;
      previewLine: string;
      heading: string;
      bodyLines: string[];
      cta?: { label: string; href: string };
    },
  ): Promise<void> {
    if (!this.isEnabled()) return;
    if (!to.email || !to.emailVerified) return;
    if (!getUserEmailPref(to.emailNotifications, prefKey)) return;

    const greeting = `Сайн байна уу, ${to.firstName || 'Хэрэглэгч'}!`;
    const html = await render(
      NotificationEmail({
        preview: params.previewLine,
        heading: params.heading,
        greeting,
        bodyLines: params.bodyLines,
        cta: params.cta,
        footerNote:
          'Та энэ төрлийн имэйлийг profile-аас удирдаж болно.',
      }),
    );

    const text = [
      greeting,
      '',
      ...params.bodyLines,
      ...(params.cta ? ['', `${params.cta.label}: ${params.cta.href}`] : []),
    ].join('\n');

    await this.send({
      to: to.email,
      subject: params.subject,
      html,
      text,
      tags: [{ name: 'type', value: prefKey }],
    });
  }

  private formatFrom(): string {
    return `${this.fromName} <${this.fromEmail}>`;
  }
}

function truncate(input: string, max: number): string {
  if (!input) return '';
  if (input.length <= max) return input;
  return `${input.slice(0, max).trimEnd()}…`;
}

function formatMnt(amount: number): string {
  return `${amount.toLocaleString('mn-MN')}₮`;
}
