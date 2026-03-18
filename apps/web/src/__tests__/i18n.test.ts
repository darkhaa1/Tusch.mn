import { mn } from '@/lib/i18n/mn';
import { en } from '@/lib/i18n/en';

describe('i18n translations', () => {
  it('mn translations have no undefined values', () => {
    const checkValues = (obj: Record<string, unknown>, path = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          checkValues(value as Record<string, unknown>, currentPath);
        } else {
          expect(value, `Missing translation: ${currentPath}`).toBeDefined();
          expect(typeof value).toBe('string');
        }
      });
    };
    checkValues(mn as unknown as Record<string, unknown>);
  });

  it('en has same keys as mn', () => {
    const getKeys = (obj: Record<string, unknown>, prefix = ''): string[] =>
      Object.entries(obj).flatMap(([k, v]) =>
        typeof v === 'object' && v !== null
          ? getKeys(v as Record<string, unknown>, prefix ? `${prefix}.${k}` : k)
          : [prefix ? `${prefix}.${k}` : k],
      );
    const mnKeys = getKeys(mn as unknown as Record<string, unknown>).sort();
    const enKeys = getKeys(en as unknown as Record<string, unknown>).sort();
    expect(enKeys).toEqual(mnKeys);
  });
});
