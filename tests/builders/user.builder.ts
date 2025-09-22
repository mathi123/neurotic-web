import { User } from '@/domain/user.model';

export const user = (data: Partial<User>) => {
  return {
    id: data.id || '550e8400-e29b-41d4-a716-446655440000',
    email: data.email || 'test@example.com',
    name: data.name || 'Test User',
    emailVerified: data.emailVerified || null,
    image: data.image || null,
    createdAt: data.createdAt || new Date(),
    updatedAt: data.updatedAt || new Date(),
  };
};
