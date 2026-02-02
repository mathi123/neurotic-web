import * as z from 'zod';
import { roleSchema } from './role.model';

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().default(null),
  role: roleSchema.nullable().default(null),
  banned: z.boolean().nullable().default(false),
  banReason: z.string().nullable().default(null),
  banExpires: z.date().nullable().default(null),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
