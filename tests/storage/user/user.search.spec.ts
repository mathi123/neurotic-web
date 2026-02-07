import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the user mappers
vi.mock('@/storage/user/user.mappers', () => ({
  dbUserToDomain: vi.fn(),
}));

import { dbUserSearch, filterToQuery } from '@/storage/user/user.search';
import { UserSortColumns, UserStatus } from '@/domain/user.filter';
import { Role } from '@/domain/role.model';
import { SortOrder } from '@/domain/utils';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain } from '@/storage/user/user.mappers';
import { user } from '../../builders/user.builder';
import { userFilter } from '../../builders/user-filter.builder';

describe('filterToQuery', () => {
  it('returns empty where clause when no filters are provided', () => {
    const filter = userFilter({});

    const result = filterToQuery(filter);

    expect(result).toEqual({});
  });

  it('returns OR clause with name and email filter when query is provided', () => {
    const filter = userFilter({ query: 'john' });

    const result = filterToQuery(filter);

    expect(result).toEqual({
      OR: [{ name: { contains: 'john', mode: 'insensitive' } }, { email: { contains: 'john', mode: 'insensitive' } }],
    });
  });

  it('trims whitespace from query', () => {
    const filter = userFilter({ query: '  john  ' });

    const result = filterToQuery(filter);

    expect(result).toEqual({
      OR: [{ name: { contains: 'john', mode: 'insensitive' } }, { email: { contains: 'john', mode: 'insensitive' } }],
    });
  });

  it('returns empty where clause when query is empty string', () => {
    const filter = userFilter({ query: '' });

    const result = filterToQuery(filter);

    expect(result).toEqual({});
  });

  describe('status filter', () => {
    it('filters by active status (banned = false)', () => {
      const filter = userFilter({ statuses: [UserStatus.ACTIVE] });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        banned: { equals: false },
      });
    });

    it('filters by banned status (banned = true)', () => {
      const filter = userFilter({ statuses: [UserStatus.BANNED] });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        banned: { equals: true },
      });
    });

    it('returns empty filter when both statuses selected (shows all)', () => {
      const filter = userFilter({ statuses: [UserStatus.ACTIVE, UserStatus.BANNED] });

      const result = filterToQuery(filter);

      expect(result).toEqual({});
    });

    it('ignores empty statuses array', () => {
      const filter = userFilter({ statuses: [] });

      const result = filterToQuery(filter);

      expect(result).toEqual({});
    });
  });

  describe('role filter', () => {
    it('filters by single role', () => {
      const filter = userFilter({ roles: [Role.ADMIN] });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        role: { in: [Role.ADMIN] },
      });
    });

    it('filters by multiple roles', () => {
      const filter = userFilter({ roles: [Role.ADMIN, Role.USER] });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        role: { in: [Role.ADMIN, Role.USER] },
      });
    });

    it('ignores empty roles array', () => {
      const filter = userFilter({ roles: [] });

      const result = filterToQuery(filter);

      expect(result).toEqual({});
    });
  });

  describe('combined filters', () => {
    it('combines query and status filters with AND', () => {
      const filter = userFilter({ query: 'john', statuses: [UserStatus.ACTIVE] });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        AND: [
          { OR: [{ name: { contains: 'john', mode: 'insensitive' } }, { email: { contains: 'john', mode: 'insensitive' } }] },
          { banned: { equals: false } },
        ],
      });
    });

    it('combines query, status, and role filters with AND', () => {
      const filter = userFilter({
        query: 'john',
        statuses: [UserStatus.ACTIVE],
        roles: [Role.ADMIN],
      });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        AND: [
          { OR: [{ name: { contains: 'john', mode: 'insensitive' } }, { email: { contains: 'john', mode: 'insensitive' } }] },
          { banned: { equals: false } },
          { role: { in: [Role.ADMIN] } },
        ],
      });
    });

    it('combines status and role filters without query', () => {
      const filter = userFilter({
        statuses: [UserStatus.BANNED],
        roles: [Role.USER],
      });

      const result = filterToQuery(filter);

      expect(result).toEqual({
        AND: [{ banned: { equals: true } }, { role: { in: [Role.USER] } }],
      });
    });
  });
});

describe('dbUserSearch', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('searches users without filter and returns paginated results', async () => {
    const filter = userFilter({});
    const dbUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        image: null,
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        emailVerified: false,
        image: 'https://example.com/avatar.png',
        role: 'admin',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date('2023-01-02T00:00:00Z'),
        updatedAt: new Date('2023-01-03T00:00:00Z'),
      },
    ];
    const domainUsers = [
      user({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        role: 'user',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      }),
      user({
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        image: 'https://example.com/avatar.png',
        role: 'admin',
        createdAt: new Date('2023-01-02T00:00:00Z'),
        updatedAt: new Date('2023-01-03T00:00:00Z'),
      }),
    ];

    const mockPrisma = {
      user: {
        count: vi.fn().mockResolvedValue(2),
        findMany: vi.fn().mockResolvedValue(dbUsers),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbUserToDomain).mockImplementation((dbUser) => {
      if (dbUser.id === '1') return domainUsers[0];
      if (dbUser.id === '2') return domainUsers[1];
      return user({});
    });

    const result = await dbUserSearch(filter);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.count).toHaveBeenCalledWith({
      where: {},
    });
    expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
    expect(dbUserToDomain).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      records: domainUsers,
      total: 2,
    });
  });

  it('searches users with query filter', async () => {
    const filter = userFilter({ query: 'john' });
    const dbUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        image: null,
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      },
    ];
    const domainUser = user({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const mockPrisma = {
      user: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue(dbUsers),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbUserToDomain).mockReturnValue(domainUser);

    const result = await dbUserSearch(filter);

    expect(mockPrisma.user.count).toHaveBeenCalledWith({
      where: {
        OR: [{ name: { contains: 'john', mode: 'insensitive' } }, { email: { contains: 'john', mode: 'insensitive' } }],
      },
    });
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ name: { contains: 'john', mode: 'insensitive' } }, { email: { contains: 'john', mode: 'insensitive' } }],
      },
      skip: 0,
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
    expect(result).toEqual({
      records: [domainUser],
      total: 1,
    });
  });

  it('searches users with pagination parameters', async () => {
    const filter = userFilter({ skip: 10, take: 5 });
    const dbUsers = [
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        emailVerified: false,
        image: null,
        role: null,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date('2023-01-03T00:00:00Z'),
        updatedAt: new Date('2023-01-04T00:00:00Z'),
      },
    ];
    const domainUser = user({
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      createdAt: new Date('2023-01-03T00:00:00Z'),
      updatedAt: new Date('2023-01-04T00:00:00Z'),
    });

    const mockPrisma = {
      user: {
        count: vi.fn().mockResolvedValue(15),
        findMany: vi.fn().mockResolvedValue(dbUsers),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbUserToDomain).mockReturnValue(domainUser);

    const result = await dbUserSearch(filter);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 10,
      take: 5,
      orderBy: { updatedAt: 'desc' },
    });
    expect(result).toEqual({
      records: [domainUser],
      total: 15,
    });
  });

  it('searches users with custom sorting', async () => {
    const filter = userFilter({
      sortBy: UserSortColumns.NAME,
      sortOrder: SortOrder.ASC,
    });
    const dbUsers = [
      {
        id: '1',
        name: 'Alice Brown',
        email: 'alice@example.com',
        emailVerified: true,
        image: null,
        role: 'user',
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      },
    ];
    const domainUser = user({
      id: '1',
      name: 'Alice Brown',
      email: 'alice@example.com',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const mockPrisma = {
      user: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue(dbUsers),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbUserToDomain).mockReturnValue(domainUser);

    const result = await dbUserSearch(filter);

    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual({
      records: [domainUser],
      total: 1,
    });
  });

  it('returns empty results when no users match', async () => {
    const filter = userFilter({ query: 'nonexistent' });

    const mockPrisma = {
      user: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await dbUserSearch(filter);

    expect(mockPrisma.user.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(dbUserToDomain).not.toHaveBeenCalled();
    expect(result).toEqual({
      records: [],
      total: 0,
    });
  });
});
