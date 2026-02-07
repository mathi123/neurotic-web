import { User } from '@/domain/user.model';
import { Role } from '@/domain/role.model';
import { Prisma } from '@/storage/client/client';

export const dbUserToDomain = (user: Prisma.UserGetPayload<Prisma.UserDefaultArgs>): User => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role as Role | null,
    banned: user.banned,
    banReason: user.banReason,
    banExpires: user.banExpires,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
