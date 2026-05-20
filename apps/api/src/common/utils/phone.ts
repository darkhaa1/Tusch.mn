/**
 * Mongolian mobile numbers are 8 digits long. Carriers (Mobicom, Unitel,
 * Skytel, G-Mobile) allocate ranges that all start with 6, 7, 8 or 9 —
 * any leading digit outside that range is not a real Mongolian mobile or
 * landline subscriber number.
 */
const MN_COUNTRY_CODE = '+976';
const MN_LOCAL_DIGITS = 8;
const MN_LEADING_DIGITS = /^[6-9]/;

/**
 * Normalize a free-form Mongolian phone number to canonical E.164.
 *
 * Accepts whitespace, dashes and parentheses, and a `+976` / `976`
 * country-code prefix or none at all. Returns the canonical form
 * (`+976XXXXXXXX`) on success and `null` on failure — never throws.
 */
export function normalizeMongolianPhone(input: string): string | null {
  if (typeof input !== 'string') return null;

  // Strip everything that is not a digit or a leading `+`.
  const cleaned = input.trim().replace(/[\s\-().]/g, '');
  if (!cleaned) return null;

  // Extract the digit body, optionally preceded by `+`.
  const match = /^(\+?)([0-9]+)$/.exec(cleaned);
  if (!match) return null;

  let digits = match[2];

  // Drop a country code if present (`+976...` or bare `976...`).
  if (digits.startsWith('976')) {
    digits = digits.slice(3);
  }

  if (digits.length !== MN_LOCAL_DIGITS) return null;
  if (!MN_LEADING_DIGITS.test(digits)) return null;

  return `${MN_COUNTRY_CODE}${digits}`;
}

export function isValidMongolianPhone(input: string): boolean {
  return normalizeMongolianPhone(input) !== null;
}
