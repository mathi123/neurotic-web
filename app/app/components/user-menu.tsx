'use client';

import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';

import { authClient } from '@/app/lib/auth';
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

interface UserMenuProps {
  name: string;
  email: string;
  image?: string | null;
  size?: 'sm' | 'default';
}

export function UserMenu({ name, email, image, size = 'default' }: UserMenuProps) {
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const avatarSize = size === 'sm' ? 'sm' : 'default';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative ${buttonSize} rounded-full`}>
          <Avatar size={avatarSize}>
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
