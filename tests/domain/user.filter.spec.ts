import { describe, expect, it } from 'vitest';
import { UserSortColumns, UserStatus, userFilterSchema } from '@/domain/user.filter';
import { Role } from '@/domain/role.model';
import { DefaultTake, MaxTake, SortOrder } from '@/domain/utils';

describe('userFilterSchema', () => {
  describe('query field', () => {
    it('accepts null query', () => {
      const result = userFilterSchema.safeParse({ query: null });
      expect(result.success).toBe(true);
      expect(result.data?.query).toBe(null);
    });

    it('accepts string query', () => {
      const result = userFilterSchema.safeParse({ query: 'test' });
      expect(result.success).toBe(true);
      expect(result.data?.query).toBe('test');
    });

    it('defaults query to null when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.query).toBe(null);
    });
  });

  describe('statuses field', () => {
    it('accepts array of valid statuses', () => {
      const result = userFilterSchema.safeParse({ statuses: [UserStatus.ACTIVE, UserStatus.BANNED] });
      expect(result.success).toBe(true);
      expect(result.data?.statuses).toEqual([UserStatus.ACTIVE, UserStatus.BANNED]);
    });

    it('accepts comma-separated string of statuses', () => {
      const result = userFilterSchema.safeParse({ statuses: 'active,banned' });
      expect(result.success).toBe(true);
      expect(result.data?.statuses).toEqual([UserStatus.ACTIVE, UserStatus.BANNED]);
    });

    it('accepts single status as string', () => {
      const result = userFilterSchema.safeParse({ statuses: 'active' });
      expect(result.success).toBe(true);
      expect(result.data?.statuses).toEqual([UserStatus.ACTIVE]);
    });

    it('defaults statuses to empty array when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.statuses).toEqual([]);
    });

    it('defaults to empty array for empty string', () => {
      const result = userFilterSchema.safeParse({ statuses: '' });
      expect(result.success).toBe(true);
      expect(result.data?.statuses).toEqual([]);
    });

    it('rejects invalid status value', () => {
      const result = userFilterSchema.safeParse({ statuses: ['invalid'] });
      expect(result.success).toBe(false);
    });
  });

  describe('roles field', () => {
    it('accepts array of valid roles', () => {
      const result = userFilterSchema.safeParse({ roles: [Role.ADMIN, Role.USER] });
      expect(result.success).toBe(true);
      expect(result.data?.roles).toEqual([Role.ADMIN, Role.USER]);
    });

    it('accepts comma-separated string of roles', () => {
      const result = userFilterSchema.safeParse({ roles: 'admin,user' });
      expect(result.success).toBe(true);
      expect(result.data?.roles).toEqual([Role.ADMIN, Role.USER]);
    });

    it('accepts single role as string', () => {
      const result = userFilterSchema.safeParse({ roles: 'admin' });
      expect(result.success).toBe(true);
      expect(result.data?.roles).toEqual([Role.ADMIN]);
    });

    it('defaults roles to empty array when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.roles).toEqual([]);
    });

    it('defaults to empty array for empty string', () => {
      const result = userFilterSchema.safeParse({ roles: '' });
      expect(result.success).toBe(true);
      expect(result.data?.roles).toEqual([]);
    });

    it('rejects invalid role value', () => {
      const result = userFilterSchema.safeParse({ roles: ['superadmin'] });
      expect(result.success).toBe(false);
    });
  });

  describe('skip field', () => {
    it('accepts valid skip value', () => {
      const result = userFilterSchema.safeParse({ skip: 10 });
      expect(result.success).toBe(true);
      expect(result.data?.skip).toBe(10);
    });

    it('defaults skip to 0 when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.skip).toBe(0);
    });

    it('rejects negative skip value', () => {
      const result = userFilterSchema.safeParse({ skip: -1 });
      expect(result.success).toBe(false);
    });

    it('coerces string to number', () => {
      const result = userFilterSchema.safeParse({ skip: '5' });
      expect(result.success).toBe(true);
      expect(result.data?.skip).toBe(5);
    });
  });

  describe('take field', () => {
    it('accepts valid take value', () => {
      const result = userFilterSchema.safeParse({ take: 20 });
      expect(result.success).toBe(true);
      expect(result.data?.take).toBe(20);
    });

    it('defaults take to DefaultTake when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.take).toBe(DefaultTake);
    });

    it('rejects negative take value', () => {
      const result = userFilterSchema.safeParse({ take: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects take value exceeding MaxTake', () => {
      const result = userFilterSchema.safeParse({ take: MaxTake + 1 });
      expect(result.success).toBe(false);
    });

    it('accepts take value equal to MaxTake', () => {
      const result = userFilterSchema.safeParse({ take: MaxTake });
      expect(result.success).toBe(true);
      expect(result.data?.take).toBe(MaxTake);
    });
  });

  describe('sortBy field', () => {
    it('accepts valid sortBy values', () => {
      const validColumns = [UserSortColumns.NAME, UserSortColumns.EMAIL, UserSortColumns.CREATED_AT, UserSortColumns.UPDATED_AT];

      validColumns.forEach((column) => {
        const result = userFilterSchema.safeParse({ sortBy: column });
        expect(result.success).toBe(true);
        expect(result.data?.sortBy).toBe(column);
      });
    });

    it('defaults sortBy to UPDATED_AT when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.sortBy).toBe(UserSortColumns.UPDATED_AT);
    });

    it('rejects invalid sortBy value', () => {
      const result = userFilterSchema.safeParse({ sortBy: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('sortOrder field', () => {
    it('accepts valid sortOrder values', () => {
      const validOrders = [SortOrder.ASC, SortOrder.DESC];

      validOrders.forEach((order) => {
        const result = userFilterSchema.safeParse({ sortOrder: order });
        expect(result.success).toBe(true);
        expect(result.data?.sortOrder).toBe(order);
      });
    });

    it('defaults sortOrder to DESC when not provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.sortOrder).toBe(SortOrder.DESC);
    });

    it('rejects invalid sortOrder value', () => {
      const result = userFilterSchema.safeParse({ sortOrder: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('strict mode', () => {
    it('rejects unexpected parameters', () => {
      const result = userFilterSchema.safeParse({ unknownParam: 'value' });
      expect(result.success).toBe(false);
    });
  });

  describe('full filter', () => {
    it('accepts complete valid filter', () => {
      const filter = {
        query: 'john',
        statuses: [UserStatus.ACTIVE],
        roles: [Role.ADMIN, Role.USER],
        skip: 10,
        take: 25,
        sortBy: UserSortColumns.NAME,
        sortOrder: SortOrder.ASC,
      };

      const result = userFilterSchema.safeParse(filter);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(filter);
    });

    it('applies all defaults when empty object provided', () => {
      const result = userFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        query: null,
        statuses: [],
        roles: [],
        skip: 0,
        take: DefaultTake,
        sortBy: UserSortColumns.UPDATED_AT,
        sortOrder: SortOrder.DESC,
      });
    });
  });
});
