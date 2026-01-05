const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Small wrapper to normalize errors and JSON parsing.
async function apiFetch<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = new Headers(options.headers || {});
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (payload as any)?.message || payload || 'Request failed';
    throw new Error(typeof message === 'string' ? message : 'Request failed');
  }

  return payload as TResponse;
}

// Auth -----------------------------------------------------------------------

export async function getCurrentUser(): Promise<any | null> {
  try {
    const data = await apiFetch<{ user: any }>('/auth/me', { method: 'GET' });
    return data.user;
  } catch {
    return null;
  }
}

export async function registerUser(body: {
  email: string;
  password: string;
  accountType: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string | null;
}) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function loginUser(body: { email: string; password: string }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function oauthLogin(body: {
  email: string;
  firstName: string;
  lastName: string;
  provider: string;
  avatarUrl?: string | null;
}) {
  return apiFetch('/auth/oauth-login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function logoutUser() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

export async function updateCurrentUser(
  body:
    | {
        firstName?: string;
        lastName?: string;
        phone?: string;
        avatarUrl?: string | null;
        accountType?: string;
      }
    | FormData
) {
  return apiFetch<{ user: any }>('/auth/me', {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function deleteCurrentUser() {
  return apiFetch('/auth/me', {
    method: 'DELETE',
  });
}

// Listings -------------------------------------------------------------------

export type ListingUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type Listing = {
  id: string;
  description: string;
  price: number;
  location?: string | null;
  category?: string | null;
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

export type ListingsPage = {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchListings(params?: { category?: string }): Promise<Listing[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) {
    searchParams.set('category', params.category);
  }
  const query = searchParams.toString();
  const path = query ? `/listings?${query}` : '/listings';
  const data = await apiFetch<{ items?: Listing[]; data?: Listing[] } | Listing[]>(path, { method: 'GET' });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return data.data || [];
}

export async function fetchListingsPage(params?: {
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<ListingsPage> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.sort) searchParams.set('sort', params.sort);
  const query = searchParams.toString();
  const path = query ? `/listings?${query}` : '/listings';

  const data = await apiFetch<
    | Listing[]
    | {
        items?: Listing[];
        total?: number;
        page?: number;
        limit?: number;
        data?: Listing[];
      }
  >(path, { method: 'GET' });

  const fallbackPage = params?.page ?? 1;
  const fallbackLimit = params?.limit ?? 12;

  if (Array.isArray(data)) {
    const start = (fallbackPage - 1) * fallbackLimit;
    const items = data.slice(start, start + fallbackLimit);
    return {
      items,
      total: data.length,
      page: fallbackPage,
      limit: fallbackLimit,
    };
  }

  const items = Array.isArray(data.items) ? data.items : data.data || [];

  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? fallbackPage,
    limit: data.limit ?? fallbackLimit,
  };
}

export async function fetchMyListings(): Promise<Listing[]> {
  const data = await apiFetch<{ data?: Listing[] } | Listing[]>('/listings/me', { method: 'GET' });
  if (Array.isArray(data)) return data;
  return data.data || [];
}

export async function fetchListingById(id: string): Promise<Listing> {
  return apiFetch(`/listings/${id}`, { method: 'GET' });
}

export async function createListing(body: {
  description: string;
  price: number;
  location?: string;
  category?: string;
}) {
  return apiFetch('/listings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateListing(
  id: string,
  body: {
    description?: string;
    price?: number;
    location?: string;
    category?: string;
  }
) {
  return apiFetch(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteListing(id: string) {
  return apiFetch(`/listings/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadListingImages(listingId: string, files: File[]) {
  if (!files.length) return;
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return apiFetch(`/listings/${listingId}/images`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteListingImage(listingId: string, imageId: string) {
  return apiFetch(`/listings/${listingId}/images/${imageId}`, {
    method: 'DELETE',
  });
}

// Users ----------------------------------------------------------------------

export async function fetchUsers(): Promise<ListingUser[]> {
  return apiFetch('/users', { method: 'GET' });
}

// Messages -------------------------------------------------------------------

export async function fetchMessageThreads(): Promise<Message[]> {
  return apiFetch('/messages/threads', { method: 'GET' });
}

export async function fetchConversationWith(userId: string): Promise<Message[]> {
  return apiFetch(`/messages/with/${userId}`, { method: 'GET' });
}

export async function sendMessage(body: { recipientId: string; listingId: string; content: string }) {
  return apiFetch<Message>('/messages', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function markMessageRead(messageId: string) {
  return apiFetch<Message>(`/messages/${messageId}/read`, { method: 'PATCH' });
}
