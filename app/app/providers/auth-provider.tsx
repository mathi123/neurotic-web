'use client';

import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { authClient } from '@/app/lib/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const socialProviders = {
    providers: ['github'],
  };

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      basePath="/app/auth"
      account={{ basePath: '/app/account' }}
      onSessionChange={() => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      Link={Link}
      social={socialProviders}
    >
      {children}
    </AuthUIProvider>
  );
}
