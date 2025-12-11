type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Small wrapper to normalize errors and JSON parsing.
async function apiFetch<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not defined');

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
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

export async function updateCurrentUser(body: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string | null;
  accountType?: string;
}) {
  return apiFetch<{ user: any }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// Listings -------------------------------------------------------------------

export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchListings(): Promise<Listing[]> {
  const data = await apiFetch<{ data?: Listing[] } | Listing[]>('/listings', { method: 'GET' });
  if (Array.isArray(data)) return data;
  return data.data || [];
}

export async function fetchMyListings(): Promise<Listing[]> {
  const data = await apiFetch<{ data?: Listing[] } | Listing[]>('/listings/me', { method: 'GET' });
  if (Array.isArray(data)) return data;
  return data.data || [];
}

export async function createListing(body: {
  title: string;
  description: string;
  price: number;
  location?: string;
}) {
  return apiFetch('/listings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Users ----------------------------------------------------------------------

export async function fetchUsers() {
  return apiFetch('/users', { method: 'GET' });
}
