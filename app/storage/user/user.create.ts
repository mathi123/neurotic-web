import { User } from '@/domain/user.model';
import { dbUserToDomain, userToDbUser } from './user.mappers';
import { getPrismaClient } from '../utils';

export const dbUserCreate = async (user: User, hashedPassword: string): Promise<User> => {
  const prisma = getPrismaClient();
  const dbUser = userToDbUser(user);
  dbUser.password = hashedPassword;

  const result = await prisma.user.create({
    data: dbUser,
  });
  return dbUserToDomain(result);
};
