import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { getPrismaClient } from './storage/utils';
import Credentials from 'next-auth/providers/credentials';
import { loginWithCredentials } from './actions/user/login';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(getPrismaClient),
  providers: [
    Credentials({
      credentials: {
        email: {
          type: 'email',
          label: 'Email',
          placeholder: 'johndoe@gmail.com',
        },
        password: {
          type: 'password',
          label: 'Password',
          placeholder: '*****',
        },
      },
      authorize: async (credentials) => {
        return await loginWithCredentials({
          email: credentials.email as string,
          password: credentials.password as string,
        });
      },
    }),
  ],
});
