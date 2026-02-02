# Authentication

Authentication is implemented using [better-auth](https://www.better-auth.com/) with pre-built UI components from [@daveyplate/better-auth-ui](https://github.com/daveyplate/better-auth-ui).

## Supported Providers

- Email/password
- GitHub OAuth

## Routes

### Auth (`/app/auth/...`)

- `/app/auth/sign-in` — Login
- `/app/auth/sign-up` — Registration
- `/app/auth/forgot-password` — Password reset request
- `/app/auth/reset-password` — Password reset form

### Account (`/app/account/...`)

- `/app/account/settings` — Account settings
- `/app/account/profile` — Profile management

## Usage

### Check Session

```typescript
import { authClient } from '@/app/lib/auth';

const { data: session } = authClient.useSession();

if (session?.user) {
  // User is authenticated
}
```

### Protect a Route

```typescript
import { authClient } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && !session) {
    redirect('/app/auth/sign-in');
  }

  return <div>Protected content</div>;
}
```
