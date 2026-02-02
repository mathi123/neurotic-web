import { Role, type UserWithRole } from './role.model';

export const hasRole = (user: UserWithRole | null | undefined, role: Role): boolean => {
  if (!user || user.banned) return false;
  return user.role === role;
};

export const isAdmin = (user: UserWithRole | null | undefined): boolean => {
  return hasRole(user, Role.ADMIN);
};

export const hasAnyRole = (user: UserWithRole | null | undefined, roles: Role[]): boolean => {
  if (!user || user.banned) return false;
  return roles.some((role) => user.role === role);
};

export const requireRole = (user: UserWithRole | null | undefined, role: Role): void => {
  if (!hasRole(user, role)) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
};

export const requireAdmin = (user: UserWithRole | null | undefined): void => {
  requireRole(user, Role.ADMIN);
};
