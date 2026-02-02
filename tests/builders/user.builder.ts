import { User } from '@/domain/user.model';

export const user = (data: Partial<User> = {}): User => {
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    name: data.name ?? 'Test User',
    email: data.email ?? 'test@example.com',
    emailVerified: data.emailVerified ?? false,
    image: data.image ?? null,
    role: data.role ?? null,
    banned: data.banned ?? false,
    banReason: data.banReason ?? null,
    banExpires: data.banExpires ?? null,
    createdAt: data.createdAt ?? new Date('2025-01-01T00:00:00Z'),
    updatedAt: data.updatedAt ?? new Date('2025-01-01T00:00:00Z'),
  };
};
