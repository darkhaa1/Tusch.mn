// components/Providers.tsx
'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthSync } from './AuthSync';
import { OnboardingRedirect } from './OnboardingRedirect';


type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <OnboardingRedirect />
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </SessionProvider>
  );
}
