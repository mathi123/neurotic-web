import { saltAndHashPassword } from '@/actions/security/password';
import { User } from '@/domain/user.model';
import { dbUserCreate } from '@/storage/user/user.create';

export const createUser = async (user: User, password: string): Promise<User> => {
  const hashedPassword = await saltAndHashPassword(password);

  return await dbUserCreate(user, hashedPassword);
};
