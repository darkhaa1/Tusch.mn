import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// Spy that captures the constructor key and lets each test override
// `emails.send`. Using a top-level mock keeps the call chain simple.
const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

// `@react-email/render` ships ESM-only and uses a dynamic import that
// Jest cannot resolve without --experimental-vm-modules. Stub it: the
// rendered HTML is replaced by a deterministic string that embeds the
// values we care about, which is enough to assert template wiring.
jest.mock('@react-email/render', () => ({
  render: jest.fn(async (element: any) => {
    const props = (element?.props ?? {}) as Record<string, unknown>;
    const fields = Object.entries(props)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join('|');
    return `<rendered-template ${fields}>`;
  }),
}));

function buildConfig(values: Record<string, string | undefined>): ConfigService {
  return {
    get: <T = string>(key: string, defaultValue?: T): T | undefined => {
      const value = values[key];
      return (value as unknown as T) ?? defaultValue;
    },
  } as unknown as ConfigService;
}

function buildService(values: Record<string, string | undefined>): EmailService {
  return new EmailService(buildConfig(values));
}

beforeEach(() => {
  mockSend.mockReset();
});

describe('EmailService', () => {
  describe('isEnabled', () => {
    it('returns false when RESEND_API_KEY is absent', () => {
      const service = buildService({
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
      });
      expect(service.isEnabled()).toBe(false);
    });

    it('returns false when RESEND_FROM_EMAIL is absent', () => {
      const service = buildService({ RESEND_API_KEY: 're_test_key' });
      expect(service.isEnabled()).toBe(false);
    });

    it('returns true when both vars are set', () => {
      const service = buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
      });
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('health', () => {
    it('returns the configured snapshot', () => {
      const service = buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
        RESEND_FROM_NAME: 'Tusch Test',
      });
      expect(service.health()).toEqual({
        configured: true,
        fromEmail: 'noreply@tusch.mn',
        fromName: 'Tusch Test',
        domain: 'tusch.mn',
      });
    });

    it('returns a disabled snapshot when not configured', () => {
      const service = buildService({});
      expect(service.health()).toEqual({
        configured: false,
        fromEmail: null,
        fromName: 'Tusch',
        domain: null,
      });
    });
  });

  describe('send', () => {
    it('returns null and does not throw when not configured', async () => {
      const service = buildService({});
      const result = await service.send({
        to: 'user@example.com',
        subject: 'Hi',
        html: '<p>Hi</p>',
      });
      expect(result).toBeNull();
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('forwards the right shape to Resend on success', async () => {
      mockSend.mockResolvedValue({ data: { id: 'mid_123' }, error: null });
      const service = buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
        RESEND_FROM_NAME: 'Tusch',
      });

      const result = await service.send({
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<p>Welcome</p>',
        text: 'Welcome',
        replyTo: 'support@tusch.mn',
        tags: [{ name: 'flow', value: 'signup' }],
      });

      expect(result).toEqual({ id: 'mid_123' });
      expect(mockSend).toHaveBeenCalledWith({
        from: 'Tusch <noreply@tusch.mn>',
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<p>Welcome</p>',
        text: 'Welcome',
        replyTo: 'support@tusch.mn',
        tags: [{ name: 'flow', value: 'signup' }],
      });
    });

    it('returns null when Resend responds with an error payload', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { name: 'validation_error', message: 'invalid sender' },
      });
      const service = buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
      });

      const result = await service.send({
        to: 'user@example.com',
        subject: 'X',
        html: '<p>X</p>',
      });
      expect(result).toBeNull();
    });

    it('returns null when the SDK throws', async () => {
      mockSend.mockRejectedValue(new Error('network down'));
      const service = buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
      });

      const result = await service.send({
        to: 'user@example.com',
        subject: 'X',
        html: '<p>X</p>',
      });
      expect(result).toBeNull();
    });
  });

  describe('high-level methods', () => {
    const enabledService = () =>
      buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
        FRONTEND_URL: 'https://tusch.test',
      });

    it('sendEmailVerification renders the template and sends with the verify URL', async () => {
      mockSend.mockResolvedValue({ data: { id: 'mid_v' }, error: null });

      await enabledService().sendEmailVerification(
        'a@b.com',
        'tok_abc',
        'Bataa',
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
      const payload = mockSend.mock.calls[0][0];
      expect(payload.to).toBe('a@b.com');
      expect(payload.subject).toBe('Имэйлээ баталгаажуулна уу');
      // Text fallback is built in-service (not via render), so it embeds
      // both the user name and the verification URL deterministically.
      expect(payload.text).toContain('Bataa');
      expect(payload.text).toContain(
        'https://tusch.test/verify-email?token=tok_abc',
      );
      expect(typeof payload.html).toBe('string');
      expect(payload.html.length).toBeGreaterThan(0);
      expect(payload.tags).toEqual([
        { name: 'flow', value: 'email-verification' },
      ]);
    });

    it('sendPasswordReset renders the template and sends with the reset URL', async () => {
      mockSend.mockResolvedValue({ data: { id: 'mid_r' }, error: null });

      await enabledService().sendPasswordReset(
        'a@b.com',
        'tok_xyz',
        'Bataa',
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
      const payload = mockSend.mock.calls[0][0];
      expect(payload.subject).toBe('Нууц үг сэргээх');
      expect(payload.text).toContain('Bataa');
      expect(payload.text).toContain(
        'https://tusch.test/reset-password?token=tok_xyz',
      );
      expect(payload.tags).toEqual([
        { name: 'flow', value: 'password-reset' },
      ]);
    });

    it('sendOfferNotification throws "Not implemented yet"', async () => {
      await expect(
        enabledService().sendOfferNotification(
          'a@b.com',
          'off_1',
          'accepted',
        ),
      ).rejects.toThrow(/Not implemented yet/);
    });

    it('sendMessageNotification throws "Not implemented yet"', async () => {
      await expect(
        enabledService().sendMessageNotification(
          'a@b.com',
          'Bataa',
          'lst_1',
        ),
      ).rejects.toThrow(/Not implemented yet/);
    });
  });
});
