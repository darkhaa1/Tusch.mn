import type { QueryClient } from '@tanstack/react-query';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logoutUser } from './api';

export async function logout(
  router: ReturnType<typeof useRouter>,
  queryClient?: QueryClient
) {
  const session = await getSession();

  // Always clear the backend session cookie, regardless of auth provider
  try {
    await logoutUser();
  } catch (error) {
    console.error('Failed to logout from API', error);
  }

  // Drop any cached user-specific data and force current-user refetch
  if (queryClient) {
    queryClient.setQueryData(['current-user'], null);
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
  }

  // If a NextAuth session exists (Google / Facebook), sign out there too
  if (session?.user) {
    await signOut({ callbackUrl: '/' });
    return;
  }

  // For credentials-only flow, just return to home
  router.push('/');
}
