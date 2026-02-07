'use client';

import Link from 'next/link';

import { authClient } from '@/app/lib/auth';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </main>
    );
  }

  if (session) {
    return <AuthenticatedHome name={session.user.name || session.user.email} />;
  }

  return <PublicHome />;
}

function PublicHome() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Welcome to Neurotic</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Your modern application platform. Sign in to get started or create an account to join us.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/app/auth/sign-up">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/app/auth/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function AuthenticatedHome({ name }: { name: string }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>New to Neurotic? Start here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Explore the features and set up your account preferences to get the most out of the platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your profile and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/account/settings">Go to settings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Learn how everything works.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Check out our documentation to learn about all the features available to you.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
