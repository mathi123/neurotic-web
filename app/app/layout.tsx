'use client';

import { usePathname } from 'next/navigation';

import { Providers } from './providers/providers';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith('/app/admin');

  return (
    <Providers>
      {!isAdminArea && <Header />}
      {children}
      <Toaster />
    </Providers>
  );
}
