import { verifyPassword } from '@/actions/security/password';
import { Credentials, credentialsSchema } from '@/domain/credentials.model';
import { User } from '@/domain/user.model';
import { readUserAndHashedPassword } from '@/storage/user/user.read';

export const loginWithCredentials = async (credentials: Credentials): Promise<User | null> => {
  const result = credentialsSchema.safeParse(credentials);

  if (!result.success) {
    throw new Error('Invalid credentials.');
  }

  const { user, hashedPassword } = await readUserAndHashedPassword(credentials.email);
  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(credentials.password, hashedPassword!);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials.');
  }

  return user;
};
