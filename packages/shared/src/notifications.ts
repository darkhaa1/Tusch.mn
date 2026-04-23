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
