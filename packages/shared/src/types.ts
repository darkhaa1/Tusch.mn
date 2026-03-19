import type {
  ListingStatus,
  NotificationType,
  OfferStatus,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  UserRole,
  UserStatus,
} from "./enums";
import type { PaginatedResponse } from "./pagination";

// ─── User ────────────────────────────────────────────────────────────────────

export type CurrentUser = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountType?: string;
  avatarUrl?: string | null;
  role?: UserRole;
  isAdmin?: boolean;
  status?: UserStatus;
  emailVerified: boolean;
  onboardingCompletedAt?: string | null;
  bio?: string | null;
  city?: string | null;
  serviceCategories?: string[];
  serviceZones?: string[];
};

export type ListingUser = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type PublicUserProfile = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    createdAt: string;
    favoritesCount: number;
    isFavorited: boolean;
    verification: {
      emailVerified: boolean;
      phoneVerified: boolean;
      idVerified: boolean;
    };
  };
  stats: {
    listingsCount: number;
    completedCount: number | null;
    responseRate: number | null;
    ratingAvg: number | null;
    reviewsCount: number;
  };
  recentListings: Array<{
    id: string;
    category: string | null;
    price: number;
    location: string | null;
    description: string;
    createdAt: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  }>;
};

export type ProviderCard = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  location?: string | null;
  topCategory?: string | null;
  listingsCount: number;
  ratingAvg?: number | null;
  reviewsCount: number;
  favoritesCount: number;
  isFavorited: boolean;
};

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string | null;
  status: UserStatus;
  deletedAt?: string | null;
  isAdmin: boolean;
  createdAt: string;
};

// ─── Listing ─────────────────────────────────────────────────────────────────

export type Listing = {
  id: string;
  description: string;
  price: number;
  location?: string | null;
  category?: string | null;
  status?: ListingStatus;
  userId: string;
  user?: ListingUser;
  images?: Array<{ id: string; url: string; thumbnailUrl?: string | null; position: number }>;
  favoritesCount: number;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminListing = {
  id: string;
  category?: string | null;
  price: number;
  location?: string | null;
  description: string;
  status: ListingStatus;
  deletedAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

// ─── Message ─────────────────────────────────────────────────────────────────

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  listingId: string;
  content: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: ListingUser;
  recipient?: ListingUser;
};

// ─── Notification ────────────────────────────────────────────────────────────

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

// ─── Review ──────────────────────────────────────────────────────────────────

export type Review = {
  id: string;
  targetUserId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
};

// ─── Report ──────────────────────────────────────────────────────────────────

export type Report = {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type AdminReport = Report & {
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  target:
    | {
        id: string;
        description: string;
        status: ListingStatus;
        deletedAt: string | null;
        user: {
          id: string;
          firstName: string;
          lastName: string;
        };
      }
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        status: UserStatus;
        deletedAt: string | null;
      }
    | null;
};

// ─── Offer ──────────────────────────────────────────────────────────────────

export type Offer = {
  id: string;
  listingId: string;
  providerId: string;
  price: number;
  message: string;
  estimatedDays: number | null;
  status: OfferStatus;
  expiresAt: string;
  respondedAt: string | null;
  completedAt?: string | null;
  clientNote?: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: ListingUser;
  listing?: {
    id: string;
    description: string;
    price: number;
    userId: string;
    category: string | null;
    location: string | null;
  };
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export type AdminStats = {
  usersTotal: number;
  usersSuspended: number;
  listingsTotal: number;
  listingsHidden: number;
  messagesTotal: number;
  reviewsTotal: number;
};

// ─── Paginated Responses ─────────────────────────────────────────────────────

export type ListingsPage = PaginatedResponse<Listing>;
export type ProvidersPage = PaginatedResponse<ProviderCard>;
export type UsersPage = PaginatedResponse<ListingUser>;
export type AdminUsersPage = PaginatedResponse<AdminUser>;
export type AdminListingsPage = PaginatedResponse<AdminListing>;
export type AdminReportsPage = PaginatedResponse<AdminReport>;
export type ReviewsPage = PaginatedResponse<Review>;

export type OffersPage = PaginatedResponse<Offer>;

export type ConversationPage = PaginatedResponse<Message> & {
  hasMore: boolean;
};

export type NotificationsPage = PaginatedResponse<Notification> & {
  unreadCount: number;
};
