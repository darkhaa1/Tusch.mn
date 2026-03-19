export const UserRole = {
  CLIENT: "CLIENT",
  PROVIDER: "PROVIDER",
  BOTH: "BOTH",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AdminRole = {
  USER: "USER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;
export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ListingStatus = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const NotificationType = {
  NEW_MESSAGE: "NEW_MESSAGE",
  NEW_REVIEW: "NEW_REVIEW",
  NEW_OFFER: "NEW_OFFER",
  OFFER_ACCEPTED: "OFFER_ACCEPTED",
  OFFER_REJECTED: "OFFER_REJECTED",
  LISTING_HIDDEN: "LISTING_HIDDEN",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const ReportTargetType = {
  LISTING: "LISTING",
  USER: "USER",
} as const;
export type ReportTargetType =
  (typeof ReportTargetType)[keyof typeof ReportTargetType];

export const ReportReason = {
  SPAM: "SPAM",
  INAPPROPRIATE: "INAPPROPRIATE",
  FRAUD: "FRAUD",
  OTHER: "OTHER",
} as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];

export const ReportStatus = {
  PENDING: "PENDING",
  REVIEWED: "REVIEWED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const OfferStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export const ListingsSort = {
  Newest: "newest",
  Oldest: "oldest",
} as const;
export type ListingsSort = (typeof ListingsSort)[keyof typeof ListingsSort];
