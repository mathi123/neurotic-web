import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/user/user.search', () => ({
  dbUserSearch: vi.fn(),
}));

import { searchUsers } from '@/actions/user/search';
import { dbUserSearch } from '@/storage/user/user.search';
import { user } from '../../builders/user.builder';
import { userFilter } from '../../builders/user-filter.builder';
import { ZodError } from 'zod';

describe('searchUsers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls dbUserSearch with validated filter', async () => {
    const filter = userFilter({ query: 'john', skip: 0, take: 10 });
    const expectedPage = {
      records: [user({ name: 'John Doe' })],
      total: 1,
    };

    vi.mocked(dbUserSearch).mockResolvedValueOnce(expectedPage);

    const result = await searchUsers(filter);

    expect(dbUserSearch).toHaveBeenCalledTimes(1);
    expect(dbUserSearch).toHaveBeenCalledWith(filter);
    expect(result).toEqual(expectedPage);
  });

  it('returns empty page when no users found', async () => {
    const filter = userFilter({});
    const expectedPage = {
      records: [],
      total: 0,
    };

    vi.mocked(dbUserSearch).mockResolvedValueOnce(expectedPage);

    const result = await searchUsers(filter);

    expect(dbUserSearch).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedPage);
  });

  it('returns paginated results', async () => {
    const filter = userFilter({ skip: 10, take: 5 });
    const users = [user({ id: '1', name: 'User 1' }), user({ id: '2', name: 'User 2' })];
    const expectedPage = {
      records: users,
      total: 50,
    };

    vi.mocked(dbUserSearch).mockResolvedValueOnce(expectedPage);

    const result = await searchUsers(filter);

    expect(dbUserSearch).toHaveBeenCalledWith(filter);
    expect(result).toEqual(expectedPage);
  });

  it('throws ZodError when filter is invalid', async () => {
    const invalidFilter = {
      query: 'test',
      skip: -1, // Invalid: negative skip
      take: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    } as any;

    await expect(searchUsers(invalidFilter)).rejects.toThrow(ZodError);
    expect(dbUserSearch).not.toHaveBeenCalled();
  });

  it('throws ZodError when filter has unexpected parameters', async () => {
    const invalidFilter = {
      query: 'test',
      skip: 0,
      take: 10,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      unexpectedParam: 'value',
    } as any;

    await expect(searchUsers(invalidFilter)).rejects.toThrow(ZodError);
    expect(dbUserSearch).not.toHaveBeenCalled();
  });
});
