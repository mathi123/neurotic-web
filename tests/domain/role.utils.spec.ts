import { describe, expect, it } from 'vitest';

import { Role } from '@/domain/role.model';
import { hasAnyRole, hasRole, isAdmin, requireAdmin } from '@/domain/role.utils';

describe('Role Utils', () => {
  it('hasRole returns true when user has the role', () => {
    expect(hasRole({ id: '1', role: 'admin' }, Role.ADMIN)).toBe(true);
  });

  it('hasRole returns false for null user or banned user', () => {
    expect(hasRole(null, Role.ADMIN)).toBe(false);
    expect(hasRole({ id: '1', role: 'admin', banned: true }, Role.ADMIN)).toBe(false);
  });

  it('isAdmin checks for admin role', () => {
    expect(isAdmin({ id: '1', role: 'admin' })).toBe(true);
    expect(isAdmin({ id: '1', role: 'user' })).toBe(false);
  });

  it('hasAnyRole checks multiple roles', () => {
    expect(hasAnyRole({ id: '1', role: 'user' }, [Role.ADMIN, Role.USER])).toBe(true);
    expect(hasAnyRole({ id: '1', role: 'guest' }, [Role.ADMIN, Role.USER])).toBe(false);
  });

  it('requireAdmin throws for non-admin', () => {
    expect(() => requireAdmin({ id: '1', role: 'admin' })).not.toThrow();
    expect(() => requireAdmin({ id: '1', role: 'user' })).toThrow('Access denied');
  });
});
