// Notification contract (shared between API and Web):
//   - NotificationKeys / NotificationKey: key constants and type
//   - NotificationTemplateVars: typed variables per notification type
//
// Actual translated text (title + body strings) lives in
//   apps/api/src/modules/notifications/notification-templates.ts
//   to keep the shared package free of runtime text.

export const NotificationKeys = {
  NEW_OFFER: 'NEW_OFFER',
  OFFER_ACCEPTED: 'OFFER_ACCEPTED',
  OFFER_REJECTED: 'OFFER_REJECTED',
  REVIEW_REQUESTED: 'REVIEW_REQUESTED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  LISTING_HIDDEN: 'LISTING_HIDDEN',
  IDENTITY_VERIFIED: 'IDENTITY_VERIFIED',
  IDENTITY_REJECTED: 'IDENTITY_REJECTED',
} as const;

export type NotificationKey = keyof typeof NotificationKeys;

export type NotificationTemplateVars = {
  NEW_OFFER: { providerName: string };
  OFFER_ACCEPTED: Record<string, never>;
  OFFER_REJECTED: Record<string, never>;
  REVIEW_REQUESTED: { partnerName: string; reviewLink: string };
  ACCOUNT_SUSPENDED: Record<string, never>;
  LISTING_HIDDEN: Record<string, never>;
  IDENTITY_VERIFIED: Record<string, never>;
  IDENTITY_REJECTED: { reason?: string };
};

// ─── Email notification preferences ──────────────────────────────────
// Persisted per-user as a JSON map on User.emailNotifications. Missing
// keys fall back to DEFAULT_EMAIL_NOTIFICATION_PREFERENCES at read time,
// so users created before the column existed get sensible defaults
// without a backfill.

export type EmailNotificationKey =
  | "newMessage"
  | "newOffer"
  | "offerAccepted"
  | "offerRejected"
  | "offerCompleted"
  | "newReview"
  | "listingFlagged"
  | "weeklyDigest";

export type EmailNotificationPreferences = Partial<
  Record<EmailNotificationKey, boolean>
>;

export const DEFAULT_EMAIL_NOTIFICATION_PREFERENCES: Required<EmailNotificationPreferences> = {
  newMessage: true,
  newOffer: true,
  offerAccepted: true,
  offerRejected: true,
  offerCompleted: true,
  newReview: true,
  listingFlagged: true,
  weeklyDigest: false,
};

/**
 * Read a single preference with the global defaults applied. Accepts any
 * shape — JSON blobs returned by Prisma are typed as JsonValue and we
 * normalise them safely here.
 */
export function getUserEmailPref(
  prefs: unknown,
  key: EmailNotificationKey,
): boolean {
  if (prefs && typeof prefs === "object" && !Array.isArray(prefs)) {
    const value = (prefs as Record<string, unknown>)[key];
    if (typeof value === "boolean") return value;
  }
  return DEFAULT_EMAIL_NOTIFICATION_PREFERENCES[key];
}

/**
 * Apply a patch onto a stored preferences blob, dropping unknown keys
 * and ignoring non-boolean values. Returns the merged object ready to
 * persist back to Prisma.
 */
export function mergeEmailPreferences(
  current: unknown,
  patch: EmailNotificationPreferences,
): EmailNotificationPreferences {
  const result: EmailNotificationPreferences =
    current && typeof current === "object" && !Array.isArray(current)
      ? ({ ...(current as EmailNotificationPreferences) })
      : {};
  for (const key of Object.keys(
    DEFAULT_EMAIL_NOTIFICATION_PREFERENCES,
  ) as EmailNotificationKey[]) {
    const value = patch[key];
    if (typeof value === "boolean") {
      result[key] = value;
    }
  }
  return result;
}
