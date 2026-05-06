// This file is a re-export barrel for types from @repo/shared.
// It contains NO web-specific type definitions — all types here live in
// packages/shared/src and are consumed by both the API and the web app.
// If you need a web-only type (e.g. React Query param shapes), define it
// in the relevant hook or component file instead.

export type {
  // Enums
  UserRole,
  UserStatus,
  ListingStatus,
  NotificationType,
  ReportTargetType,
  ReportReason,
  ReportStatus,
  VerificationStatus,
  // Types
  CurrentUser,
  ListingUser,
  Listing,
  Message,
  Notification,
  Offer,
  PublicUserProfile,
  ProviderCard,
  ServiceZone,
  AdminUser,
  AdminListing,
  Review,
  Report,
  AdminReport,
  AdminStats,
  VerificationStatusResponse,
  AdminVerificationItem,
  AdminVerificationsPage,
  // Paginated responses
  PaginatedResponse,
  ListingsPage,
  ProvidersPage,
  UsersPage,
  AdminUsersPage,
  AdminListingsPage,
  AdminReportsPage,
  ReviewsPage,
  ConversationPage,
  NotificationsPage,
  OffersPage,
} from "@repo/shared";
