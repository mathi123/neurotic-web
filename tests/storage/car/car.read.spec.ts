import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the car mappers
vi.mock('@/storage/car/car.mappers', () => ({
  dbCarToDomain: vi.fn(),
}));

import { dbCarRead } from '@/storage/car/car.read';
import { getPrismaClient } from '@/storage/utils';
import { dbCarToDomain } from '@/storage/car/car.mappers';
import { car } from '../../builders/car.builder';

describe('dbCarRead', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('reads a car from the database and returns the domain car', async () => {
    const carId = '123';
    const dbCar = {
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
        findUniqueOrThrow: vi.fn().mockResolvedValue(dbCar),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbCarToDomain).mockReturnValue(expectedDomainCar);

    const result = await dbCarRead(carId);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: carId },
    });
    expect(dbCarToDomain).toHaveBeenCalledTimes(1);
    expect(dbCarToDomain).toHaveBeenCalledWith(dbCar);
    expect(result).toEqual(expectedDomainCar);
  });

  it('reads a car with different id and name correctly', async () => {
    const carId = '456';
    const dbCar = {
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
        findUniqueOrThrow: vi.fn().mockResolvedValue(dbCar),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbCarToDomain).mockReturnValue(expectedDomainCar);

    const result = await dbCarRead(carId);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: carId },
    });
    expect(dbCarToDomain).toHaveBeenCalledTimes(1);
    expect(dbCarToDomain).toHaveBeenCalledWith(dbCar);
    expect(result).toEqual(expectedDomainCar);
  });

  it('throws when car is not found', async () => {
    const carId = 'non-existent-id';
    const error = new Error('Car not found');

    const mockPrisma = {
      car: {
        findUniqueOrThrow: vi.fn().mockRejectedValue(error),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    await expect(dbCarRead(carId)).rejects.toThrow(error);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: carId },
    });
    expect(dbCarToDomain).not.toHaveBeenCalled();
  });
});
