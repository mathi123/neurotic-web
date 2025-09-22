import { User } from '@/domain/user.model';
import { getPrismaClient } from '../utils';
import { dbUserToDomain } from './user.mappers';

export const readUserAndHashedPassword = async (email: string): Promise<{ user: User | null; hashedPassword: string | null }> => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { user: null, hashedPassword: null };
  }

  return { user: dbUserToDomain(user), hashedPassword: user.password };
};
