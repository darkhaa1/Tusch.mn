export type UserRole = "CLIENT" | "PROVIDER" | "BOTH";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type ListingStatus = "ACTIVE" | "HIDDEN";

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
