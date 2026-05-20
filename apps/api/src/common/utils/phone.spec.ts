import { isValidMongolianPhone, normalizeMongolianPhone } from './phone';

describe('normalizeMongolianPhone', () => {
  describe('accepted inputs', () => {
    const cases: Array<[string, string]> = [
      ['99112233', '+97699112233'],
      ['+97699112233', '+97699112233'],
      ['97699112233', '+97699112233'],
      ['+976 99 11 22 33', '+97699112233'],
      ['+976-9911-2233', '+97699112233'],
      [' 99-11-22-33 ', '+97699112233'],
      ['(976) 9911 2233', '+97699112233'],
      ['80000000', '+97680000000'],
      ['60000000', '+97660000000'],
      ['79999999', '+97679999999'],
    ];

    for (const [input, expected] of cases) {
      it(`normalizes ${JSON.stringify(input)} to ${expected}`, () => {
        expect(normalizeMongolianPhone(input)).toBe(expected);
      });
    }
  });

  describe('rejected inputs', () => {
    const rejects: Array<[string, string]> = [
      ['', 'empty string'],
      ['   ', 'whitespace only'],
      ['abc', 'letters'],
      ['+1 555 123 4567', 'non-Mongolian country code'],
      ['1234567890', 'random ten digits without country code'],
      ['9911223', 'too short (7 digits)'],
      ['991122334', 'too long (9 digits)'],
      ['+976991122334', 'too long with country code'],
      ['+976 1234 5678', 'invalid leading digit (1)'],
      ['29112233', 'invalid leading digit (2)'],
      ['39112233', 'invalid leading digit (3)'],
      ['49112233', 'invalid leading digit (4)'],
      ['59112233', 'invalid leading digit (5)'],
      ['9911 22--', 'partial / malformed'],
      ['++97699112233', 'double plus prefix'],
    ];

    for (const [input, label] of rejects) {
      it(`rejects ${label}: ${JSON.stringify(input)}`, () => {
        expect(normalizeMongolianPhone(input)).toBeNull();
      });
    }
  });

  it('does not throw on non-string input', () => {
    // The signature is `string`, but defensive runtime callers may pass
    // garbage from req bodies — make sure we still return null.
    expect(
      normalizeMongolianPhone(undefined as unknown as string),
    ).toBeNull();
    expect(normalizeMongolianPhone(null as unknown as string)).toBeNull();
    expect(normalizeMongolianPhone(123 as unknown as string)).toBeNull();
  });
});

describe('isValidMongolianPhone', () => {
  it('returns true for a normalizable number', () => {
    expect(isValidMongolianPhone('+97699112233')).toBe(true);
    expect(isValidMongolianPhone('99112233')).toBe(true);
  });

  it('returns false for an invalid number', () => {
    expect(isValidMongolianPhone('1234')).toBe(false);
    expect(isValidMongolianPhone('+1 555 123 4567')).toBe(false);
    expect(isValidMongolianPhone('')).toBe(false);
  });
});
