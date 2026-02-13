export type UserRole = "CLIENT" | "PROVIDER" | "BOTH";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type ListingStatus = "ACTIVE" | "HIDDEN";
export type NotificationType =
  | "NEW_MESSAGE"
  | "NEW_REVIEW"
  | "LISTING_HIDDEN"
  | "ACCOUNT_SUSPENDED";
export type ReportTargetType = "LISTING" | "USER";
export type ReportReason = "SPAM" | "INAPPROPRIATE" | "FRAUD" | "OTHER";
export type ReportStatus = "PENDING" | "REVIEWED" | "DISMISSED";

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
};

export type ListingUser = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type Listing = {
  id: string;
  description: string;
  price: number;
  location?: string | null;
  category?: string | null;
  status?: ListingStatus;
  userId: string;
  user?: ListingUser;
  images?: Array<{ id: string; url: string; position: number }>;
  createdAt: string;
  updatedAt: string;
};

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

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type PublicUserProfile = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    createdAt: string;
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
};

export type ProvidersPage = {
  items: ProviderCard[];
  total: number;
  page: number;
  limit: number;
};

export type ListingsPage = {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
};

export type AdminStats = {
  usersTotal: number;
  usersSuspended: number;
  listingsTotal: number;
  listingsHidden: number;
  messagesTotal: number;
  reviewsTotal: number;
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

export type AdminUsersPage = {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
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

export type AdminListingsPage = {
  items: AdminListing[];
  total: number;
  page: number;
  limit: number;
};

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

export type ReviewsPage = {
  items: Review[];
  total: number;
  page: number;
  limit: number;
};

export type ConversationPage = {
  items: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type UsersPage = {
  items: ListingUser[];
  total: number;
  page: number;
  limit: number;
};

export type NotificationsPage = {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
};

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

export type AdminReportsPage = {
  items: AdminReport[];
  total: number;
  page: number;
  limit: number;
};
