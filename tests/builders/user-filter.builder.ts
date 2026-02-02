import { UserFilter, UserSortColumns } from '@/domain/user.filter';
import { SortOrder } from '@/domain/utils';

export const userFilter = (data: Partial<UserFilter> = {}): UserFilter => {
  return {
    query: data.query ?? null,
    statuses: data.statuses ?? [],
    roles: data.roles ?? [],
    skip: data.skip ?? 0,
    take: data.take ?? 10,
    sortBy: data.sortBy ?? UserSortColumns.UPDATED_AT,
    sortOrder: data.sortOrder ?? SortOrder.DESC,
  };
};
