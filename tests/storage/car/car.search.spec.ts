import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the car mappers
vi.mock('@/storage/car/car.mappers', () => ({
  dbCarToDomain: vi.fn(),
}));

import { dbCarSearch, filterToQuery } from '@/storage/car/car.search';
import { CarFilter, CarSortColumns } from '@/domain/car.filter';
import { SortOrder } from '@/domain/utils';
import { getPrismaClient } from '@/storage/utils';
import { dbCarToDomain } from '@/storage/car/car.mappers';
import { car } from '../../builders/car.builder';
import { carFilter } from '../../builders/car-filter.builder';

describe('filterToQuery', () => {
  it('returns empty where clause when query is null', () => {
    const filter: CarFilter = {
      query: null,
      skip: 0,
      take: 10,
      sortBy: CarSortColumns.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    };

    const result = filterToQuery(filter);

    expect(result).toEqual({
      name: undefined,
    });
  });

  it('returns where clause with name filter when query is provided', () => {
    const filter: CarFilter = {
      query: 'Tesla',
      skip: 0,
      take: 10,
      sortBy: CarSortColumns.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    };

    const result = filterToQuery(filter);

    expect(result).toEqual({
      name: {
        contains: 'Tesla',
        mode: 'insensitive',
      },
    });
  });

  it('trims whitespace from query', () => {
    const filter: CarFilter = {
      query: '  Tesla  ',
      skip: 0,
      take: 10,
      sortBy: CarSortColumns.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    };

    const result = filterToQuery(filter);

    expect(result).toEqual({
      name: {
        contains: 'Tesla',
        mode: 'insensitive',
      },
    });
  });

  it('returns where clause with empty string when query is only whitespace', () => {
    const filter: CarFilter = {
      query: '   ',
      skip: 0,
      take: 10,
      sortBy: CarSortColumns.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    };

    const result = filterToQuery(filter);

    expect(result).toEqual({
      name: {
        contains: '',
        mode: 'insensitive',
      },
    });
  });

  it('returns where clause with case insensitive search', () => {
    const filter: CarFilter = {
      query: 'tesla',
      skip: 0,
      take: 10,
      sortBy: CarSortColumns.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    };

    const result = filterToQuery(filter);

    expect(result).toEqual({
      name: {
        contains: 'tesla',
        mode: 'insensitive',
      },
    });
  });

  describe('dbCarSearch', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('searches cars without filter and returns paginated results', async () => {
      const filter = carFilter({});
      const dbCars = [
        {
          id: '1',
          name: 'Tesla Model S',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
        {
          id: '2',
          name: 'Honda Civic',
          createdAt: new Date('2023-01-02T00:00:00Z'),
          updatedAt: new Date('2023-01-03T00:00:00Z'),
        },
      ];
      const domainCars = [
        car({
          id: '1',
          name: 'Tesla Model S',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        }),
        car({
          id: '2',
          name: 'Honda Civic',
          createdAt: new Date('2023-01-02T00:00:00Z'),
          updatedAt: new Date('2023-01-03T00:00:00Z'),
        }),
      ];

      const mockPrisma = {
        car: {
          count: vi.fn().mockResolvedValue(2),
          findMany: vi.fn().mockResolvedValue(dbCars),
        },
      };

      vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
      vi.mocked(dbCarToDomain).mockImplementation((dbCar) => {
        if (dbCar.id === '1') return domainCars[0];
        if (dbCar.id === '2') return domainCars[1];
        return car({});
      });

      const result = await dbCarSearch(filter);

      expect(getPrismaClient).toHaveBeenCalledTimes(1);
      expect(mockPrisma.car.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.car.count).toHaveBeenCalledWith({
        where: { name: undefined },
      });
      expect(mockPrisma.car.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrisma.car.findMany).toHaveBeenCalledWith({
        where: { name: undefined },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });
      expect(dbCarToDomain).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        records: domainCars,
        total: 2,
      });
    });

    it('searches cars with query filter', async () => {
      const filter = carFilter({ query: 'Tesla' });
      const dbCars = [
        {
          id: '1',
          name: 'Tesla Model S',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
      ];
      const domainCar = car({
        id: '1',
        name: 'Tesla Model S',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      });

      const mockPrisma = {
        car: {
          count: vi.fn().mockResolvedValue(1),
          findMany: vi.fn().mockResolvedValue(dbCars),
        },
      };

      vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
      vi.mocked(dbCarToDomain).mockReturnValue(domainCar);

      const result = await dbCarSearch(filter);

      expect(mockPrisma.car.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'Tesla',
            mode: 'insensitive',
          },
        },
      });
      expect(mockPrisma.car.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'Tesla',
            mode: 'insensitive',
          },
        },
        skip: 0,
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual({
        records: [domainCar],
        total: 1,
      });
    });

    it('searches cars with pagination parameters', async () => {
      const filter = carFilter({ skip: 10, take: 5 });
      const dbCars = [
        {
          id: '3',
          name: 'Ford Mustang',
          createdAt: new Date('2023-01-03T00:00:00Z'),
          updatedAt: new Date('2023-01-04T00:00:00Z'),
        },
      ];
      const domainCar = car({
        id: '3',
        name: 'Ford Mustang',
        createdAt: new Date('2023-01-03T00:00:00Z'),
        updatedAt: new Date('2023-01-04T00:00:00Z'),
      });

      const mockPrisma = {
        car: {
          count: vi.fn().mockResolvedValue(15),
          findMany: vi.fn().mockResolvedValue(dbCars),
        },
      };

      vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
      vi.mocked(dbCarToDomain).mockReturnValue(domainCar);

      const result = await dbCarSearch(filter);

      expect(mockPrisma.car.findMany).toHaveBeenCalledWith({
        where: { name: undefined },
        skip: 10,
        take: 5,
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual({
        records: [domainCar],
        total: 15,
      });
    });

    it('searches cars with custom sorting', async () => {
      const filter = carFilter({
        sortBy: CarSortColumns.NAME,
        sortOrder: SortOrder.ASC,
      });
      const dbCars = [
        {
          id: '1',
          name: 'Audi A4',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
      ];
      const domainCar = car({
        id: '1',
        name: 'Audi A4',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      });

      const mockPrisma = {
        car: {
          count: vi.fn().mockResolvedValue(1),
          findMany: vi.fn().mockResolvedValue(dbCars),
        },
      };

      vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
      vi.mocked(dbCarToDomain).mockReturnValue(domainCar);

      const result = await dbCarSearch(filter);

      expect(mockPrisma.car.findMany).toHaveBeenCalledWith({
        where: { name: undefined },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual({
        records: [domainCar],
        total: 1,
      });
    });

    it('searches cars with no sorting when sortBy is null', async () => {
      const filter = {
        query: null,
        skip: 0,
        take: 10,
        sortBy: null as any,
        sortOrder: SortOrder.DESC,
      } as CarFilter;
      const dbCars = [
        {
          id: '1',
          name: 'Tesla Model S',
          createdAt: new Date('2023-01-01T00:00:00Z'),
          updatedAt: new Date('2023-01-02T00:00:00Z'),
        },
      ];
      const domainCar = car({
        id: '1',
        name: 'Tesla Model S',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      });

      const mockPrisma = {
        car: {
          count: vi.fn().mockResolvedValue(1),
          findMany: vi.fn().mockResolvedValue(dbCars),
        },
      };

      vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
      vi.mocked(dbCarToDomain).mockReturnValue(domainCar);

      const result = await dbCarSearch(filter);

      expect(mockPrisma.car.findMany).toHaveBeenCalledWith({
        where: { name: undefined },
        skip: 0,
        take: 10,
        orderBy: undefined,
      });
      expect(result).toEqual({
        records: [domainCar],
        total: 1,
      });
    });

    it('returns empty results when no cars match', async () => {
      const filter = carFilter({ query: 'NonExistentCar' });

      const mockPrisma = {
        car: {
          count: vi.fn().mockResolvedValue(0),
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

      const result = await dbCarSearch(filter);

      expect(mockPrisma.car.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.car.findMany).toHaveBeenCalledTimes(1);
      expect(dbCarToDomain).not.toHaveBeenCalled();
      expect(result).toEqual({
        records: [],
        total: 0,
      });
    });
  });
});
