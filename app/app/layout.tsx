'use client';

import { Providers } from './providers/providers';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      {children}
      <Toaster />
    </Providers>
  );
}
