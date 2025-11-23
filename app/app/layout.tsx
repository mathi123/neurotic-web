'use client';

import '@/app/globals.css';
import { Providers } from './providers/providers';
import { Toaster } from './components/ui/sonner';
import { ThemeToggle } from './components/theme-toggle';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeToggle />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
