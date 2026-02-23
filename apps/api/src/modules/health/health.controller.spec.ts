import { HealthController } from './health.controller';

describe('HealthController', () => {
  describe('liveness', () => {
    it('should return { status: "ok" }', () => {
      const controller = new HealthController(
        {} as any,
        {} as any,
        {} as any,
      );
      expect(controller.liveness()).toEqual({ status: 'ok' });
    });
  });
});
