'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AuthSync } from './AuthSync';
import { OnboardingRedirect } from './OnboardingRedirect';
import { ErrorBoundary } from '@web/components/common/ErrorBoundary';
import { ToastProvider } from '@web/components/common/ToastProvider';
import { useToast } from '@web/lib/hooks/useToast';

type Props = {
  children: React.ReactNode;
};

function QueryErrorHandler() {
  const queryClient = useQueryClient();
  const { error: toastError, info: toastInfo } = useToast();

  React.useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated') return;
      const { error } = event.query.state;
      if (!error) return;

      const msg = error instanceof Error ? error.message : 'Алдаа гарлаа';
      const is4xx =
        msg.includes('401') ||
        msg.includes('403') ||
        msg.includes('Unauthorized') ||
        msg.includes('Forbidden') ||
        msg.includes('Not Found');

      if (is4xx) {
        toastInfo(msg);
      } else {
        toastError('Серверт алдаа гарлаа. Дахин оролдоно уу.');
      }
    });
  }, [queryClient, toastError, toastInfo]);

  return null;
}

const queryClientSingleton = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export function Providers({ children }: Props) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <QueryClientProvider client={queryClientSingleton}>
          <ToastProvider>
            <QueryErrorHandler />
            <AuthSync />
            <OnboardingRedirect />
            {children}
          </ToastProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
