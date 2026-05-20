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

  describe('US-E2 stub methods', () => {
    const enabledService = () =>
      buildService({
        RESEND_API_KEY: 're_test_key',
        RESEND_FROM_EMAIL: 'noreply@tusch.mn',
      });

    it('sendEmailVerification throws "Not implemented yet"', async () => {
      await expect(
        enabledService().sendEmailVerification('a@b.com', 'tok'),
      ).rejects.toThrow(/Not implemented yet/);
    });

    it('sendPasswordReset throws "Not implemented yet"', async () => {
      await expect(
        enabledService().sendPasswordReset('a@b.com', 'tok'),
      ).rejects.toThrow(/Not implemented yet/);
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
