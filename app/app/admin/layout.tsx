'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users } from 'lucide-react';

import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { Separator } from '@/app/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/app/components/ui/sidebar';
import { Skeleton } from '@/app/components/ui/skeleton';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { UserMenu } from '@/app/components/user-menu';

const sidebarItems = [
  {
    title: 'Users',
    href: '/app/admin/users',
    icon: Users,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, isPending } = useIsAdmin();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="Back to App">
                <Link href="/app">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold">
                    N
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Neurotic</span>
                    <span className="text-muted-foreground text-xs">Admin</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-background sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isSessionPending ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : session ? (
              <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} size="sm" />
            ) : null}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
