'use client';

import Link from 'next/link';
import { LogOut, Settings, Shield } from 'lucide-react';

import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from './ui/navigation-menu';
import { Skeleton } from './ui/skeleton';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/app" className="text-xl font-semibold">
            Neurotic
          </Link>

          {isAdmin && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href="/app/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isPending ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : session ? (
            <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} />
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

function UserMenu({ name, email, image }: { name: string; email: string; image?: string | null }) {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar>
            {image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{name}</p>
            <p className="text-muted-foreground text-xs leading-none">{email}</p>
          </div>
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
