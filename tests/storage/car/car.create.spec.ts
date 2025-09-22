import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the car mappers
vi.mock('@/storage/car/car.mappers', () => ({
  carToDbCar: vi.fn(),
  dbCarToDomain: vi.fn(),
}));

import { dbCarCreate } from '@/storage/car/car.create';
import { getPrismaClient } from '@/storage/utils';
import { carToDbCar, dbCarToDomain } from '@/storage/car/car.mappers';
import { car } from '../../builders/car.builder';

describe('dbCarCreate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a car in the database and returns the domain car', async () => {
    const inputCar = car({
      name: 'Tesla Model S',
    });
    const dbCar = {
      name: 'Tesla Model S',
    };
    const createdDbCar = {
      id: '123',
      name: 'Tesla Model S',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };
    const expectedDomainCar = car({
      id: '123',
      name: 'Tesla Model S',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const mockPrisma = {
      car: {
        create: vi.fn().mockResolvedValue(createdDbCar),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(carToDbCar).mockReturnValue(dbCar);
    vi.mocked(dbCarToDomain).mockReturnValue(expectedDomainCar);

    const result = await dbCarCreate(inputCar);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(carToDbCar).toHaveBeenCalledTimes(1);
    expect(carToDbCar).toHaveBeenCalledWith(inputCar);
    expect(mockPrisma.car.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.create).toHaveBeenCalledWith({
      data: dbCar,
    });
    expect(dbCarToDomain).toHaveBeenCalledTimes(1);
    expect(dbCarToDomain).toHaveBeenCalledWith(createdDbCar);
    expect(result).toEqual(expectedDomainCar);
  });

  it('creates a car with different name correctly', async () => {
    const inputCar = car({
      name: 'Honda Civic',
    });
    const dbCar = {
      name: 'Honda Civic',
    };
    const createdDbCar = {
      id: '456',
      name: 'Honda Civic',
      createdAt: new Date('2024-05-15T10:30:00Z'),
      updatedAt: new Date('2024-05-16T14:45:00Z'),
    };
    const expectedDomainCar = car({
      id: '456',
      name: 'Honda Civic',
      createdAt: new Date('2024-05-15T10:30:00Z'),
      updatedAt: new Date('2024-05-16T14:45:00Z'),
    });

    const mockPrisma = {
      car: {
        create: vi.fn().mockResolvedValue(createdDbCar),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(carToDbCar).mockReturnValue(dbCar);
    vi.mocked(dbCarToDomain).mockReturnValue(expectedDomainCar);

    const result = await dbCarCreate(inputCar);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(carToDbCar).toHaveBeenCalledTimes(1);
    expect(carToDbCar).toHaveBeenCalledWith(inputCar);
    expect(mockPrisma.car.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.create).toHaveBeenCalledWith({
      data: dbCar,
    });
    expect(dbCarToDomain).toHaveBeenCalledTimes(1);
    expect(dbCarToDomain).toHaveBeenCalledWith(createdDbCar);
    expect(result).toEqual(expectedDomainCar);
  });
});
