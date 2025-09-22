import { User } from '@/domain/user.model';
import { Prisma } from '@/storage/client/client';
import { UserDefaultArgs } from '../client/models';

export const userToDbUser = (user: User): Prisma.UserCreateInput => {
  return {
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    image: user.image,
  };
};

export const dbUserToDomain = (user: Prisma.UserGetPayload<UserDefaultArgs>): User => {
  return {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    image: user.image,
  };
};
