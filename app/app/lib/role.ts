'use client';

import { useMemo } from 'react';

import { Role, type UserWithRole } from '@/domain/role.model';
import { hasAnyRole, hasRole, isAdmin } from '@/domain/role.utils';

import { authClient } from './auth';

type Session = ReturnType<typeof authClient.useSession>['data'];

const getUserFromSession = (session: Session): UserWithRole | null => {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    role: session.user.role,
    banned: session.user.banned,
  };
};

export const useRole = () => {
  const { data: session, isPending } = authClient.useSession();

  const user = useMemo(() => getUserFromSession(session), [session]);

  return useMemo(
    () => ({
      role: user?.role ?? null,
      isAdmin: isAdmin(user),
      isBanned: user?.banned ?? false,
      isPending,
      hasRole: (role: Role) => hasRole(user, role),
      hasAnyRole: (roles: Role[]) => hasAnyRole(user, roles),
    }),
    [user, isPending],
  );
};

export const useIsAdmin = () => {
  const { isAdmin, isPending } = useRole();
  return { isAdmin, isPending };
};
