import * as z from 'zod';
import { DefaultTake, MaxTake, SortOrder } from './utils';

export enum CarSortColumns {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const carFilterSchema = z
  .object({
    query: z.string().nullable().default(null),
    skip: z.coerce.number().int().min(0).default(0),
    take: z.coerce.number().int().min(0).max(MaxTake).default(DefaultTake),
    sortBy: z.enum(Object.values(CarSortColumns)).default(CarSortColumns.UPDATED_AT),
    sortOrder: z.enum(SortOrder).default(SortOrder.DESC),
  })
  .strict();

export type CarFilter = z.infer<typeof carFilterSchema>;
