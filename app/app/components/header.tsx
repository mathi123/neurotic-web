'use client';

import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';

import { authClient } from '@/app/lib/auth';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/app" className="text-xl font-semibold">
          Neurotic
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isPending ? (
            <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
          ) : session ? (
            <UserMenu email={session.user.email} />
          ) : (
            <AuthLinks />
          )}
        </div>
      </div>
    </header>
  );
}

function AuthLinks() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/app/auth/sign-in">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/app/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}

function UserMenu({ email }: { email: string }) {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User className="h-4 w-4" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/account/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
