import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { getPrismaClient } from './storage/utils';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(getPrismaClient),
  ...authConfig,
});
