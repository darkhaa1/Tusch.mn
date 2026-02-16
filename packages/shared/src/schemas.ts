/**
 * Shared validation constants used by both frontend (Zod) and backend (class-validator).
 *
 * NOTE: Zod schemas are NOT shared directly because the frontend uses Zod v4
 * while the backend uses Zod v3. Instead, both apps reference these constants
 * to keep validation rules in sync.
 */

export const LISTING_RULES = {
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  PRICE_MIN: 0,
  LOCATION_MAX: 255,
  CATEGORY_MAX: 100,
} as const;

export const REVIEW_RULES = {
  RATING_MIN: 1,
  RATING_MAX: 5,
  COMMENT_MAX: 2000,
} as const;

export const REPORT_RULES = {
  DESCRIPTION_MAX: 1000,
} as const;

export const MESSAGE_RULES = {
  CONTENT_MAX: 5000,
} as const;

export const AUTH_RULES = {
  PASSWORD_MIN: 6,
  RESET_PASSWORD_MIN: 8,
} as const;

export const SEARCH_RULES = {
  QUERY_MAX: 100,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LISTINGS_LIMIT: 12,
  MESSAGES_LIMIT: 30,
  REVIEWS_LIMIT: 10,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  MAX_MESSAGES_LIMIT: 100,
} as const;
