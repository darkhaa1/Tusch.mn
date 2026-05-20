/**
 * Mongolian mobile numbers are 8 digits long. Carriers (Mobicom, Unitel,
 * Skytel, G-Mobile) allocate ranges that all start with 6, 7, 8 or 9 —
 * any leading digit outside that range is not a real Mongolian mobile or
 * landline subscriber number.
 */
const MN_COUNTRY_CODE = "+976";
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
  if (typeof input !== "string") return null;

  const cleaned = input.trim().replace(/[\s\-().]/g, "");
  if (!cleaned) return null;

  const match = /^(\+?)([0-9]+)$/.exec(cleaned);
  if (!match || !match[2]) return null;

  let digits: string = match[2];

  if (digits.startsWith("976")) {
    digits = digits.slice(3);
  }

  if (digits.length !== MN_LOCAL_DIGITS) return null;
  if (!MN_LEADING_DIGITS.test(digits)) return null;

  return `${MN_COUNTRY_CODE}${digits}`;
}

export function isValidMongolianPhone(input: string): boolean {
  return normalizeMongolianPhone(input) !== null;
}

/**
 * Pretty-print an E.164 Mongolian number for display, e.g.
 * `+97699112233` → `+976 9911 2233`. Falls back to the input if the value
 * is not a canonical MN E.164 string.
 */
export function formatMongolianPhoneDisplay(e164: string): string {
  if (!/^\+976\d{8}$/.test(e164)) return e164;
  const local = e164.slice(4);
  return `${MN_COUNTRY_CODE} ${local.slice(0, 4)} ${local.slice(4)}`;
}

/**
 * Mask the middle digits of an E.164 MN phone for confirmation screens:
 * `+97699112233` → `+976 99 ** ** 33`. Useful in the verify-code state.
 */
export function maskMongolianPhone(e164: string): string {
  if (!/^\+976\d{8}$/.test(e164)) return e164;
  const local = e164.slice(4);
  return `${MN_COUNTRY_CODE} ${local.slice(0, 2)} ** ** ${local.slice(6)}`;
}
