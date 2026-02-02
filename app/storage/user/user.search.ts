import { User } from '@/domain/user.model';
import { UserFilter, UserStatus } from '@/domain/user.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbUserToDomain } from './user.mappers';

export const filterToQuery = (filter: UserFilter): Prisma.UserWhereInput => {
  const conditions: Prisma.UserWhereInput[] = [];

  // Text search on name and email
  if (filter.query) {
    const query = filter.query.trim();
    const searchCondition = {
      contains: query,
      mode: 'insensitive' as const,
    };
    conditions.push({
      OR: [{ name: searchCondition }, { email: searchCondition }],
    });
  }

  // Status filter (maps to banned field)
  // Boolean fields don't support 'in' operator, so we handle this specially
  if (filter.statuses.length === 1) {
    // If only one status selected, filter by it
    const isBanned = filter.statuses[0] === UserStatus.BANNED;
    conditions.push({
      banned: { equals: isBanned },
    });
  }
  // If both statuses selected or none, no filter needed (show all)

  // Role filter
  if (filter.roles.length > 0) {
    conditions.push({
      role: { in: filter.roles },
    });
  }

  if (conditions.length === 0) {
    return {};
  }

  return conditions.length === 1 ? conditions[0] : { AND: conditions };
};

export const dbUserSearch = async (filter: UserFilter): Promise<Page<User>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.user.count({
    where: whereClause,
  });
  const users = await prisma.user.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
  });
  return {
    records: users.map(dbUserToDomain),
    total,
  };
};
