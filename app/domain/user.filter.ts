import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';
import { Role, roleSchema } from './role.model';

export enum UserSortColumns {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const UserStatus = {
  ACTIVE: 'active',
  BANNED: 'banned',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const userStatusSchema = z.enum([UserStatus.ACTIVE, UserStatus.BANNED]);

// Helper to parse comma-separated string to array (for query params)
const commaSeparatedArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([schema.array(), z.string()])
    .transform((val): z.output<T>[] => {
      if (typeof val === 'string') {
        const arr = val ? val.split(',') : [];
        return schema.array().parse(arr);
      }
      return val;
    })
    .default([]);

export const userFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    statuses: commaSeparatedArray(userStatusSchema),
    roles: commaSeparatedArray(roleSchema),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(UserSortColumns) as [string, ...string[]]).default(UserSortColumns.UPDATED_AT),
    sortOrder: z.enum(Object.values(SortOrder) as [string, ...string[]]).default(SortOrder.DESC),
  })
  .strict();

export type UserFilter = z.infer<typeof userFilterSchema>;

// Export all status and role values for UI
export const ALL_USER_STATUSES: UserStatus[] = [UserStatus.ACTIVE, UserStatus.BANNED];
export const ALL_USER_ROLES: Role[] = [Role.ADMIN, Role.USER];
