import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the car mappers
vi.mock('@/storage/car/car.mappers', () => ({
  dbCarToDomain: vi.fn(),
  carToDbCarUpdate: vi.fn((car) => ({ name: car.name })),
}));

import { dbCarUpdate } from '@/storage/car/car.update';
import { getPrismaClient } from '@/storage/utils';
import { dbCarToDomain } from '@/storage/car/car.mappers';
import { car } from '../../builders/car.builder';

describe('dbCarUpdate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates a car in the database and returns the domain car', async () => {
    const inputCar = car({
      id: '123',
      name: 'Updated Tesla Model S',
    });
    const updatedDbCar = {
      id: '123',
      name: 'Updated Tesla Model S',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };
    const expectedDomainCar = car({
      id: '123',
      name: 'Updated Tesla Model S',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const mockPrisma = {
      car: {
        update: vi.fn().mockResolvedValue(updatedDbCar),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbCarToDomain).mockReturnValue(expectedDomainCar);

    const result = await dbCarUpdate(inputCar);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.update).toHaveBeenCalledWith({
      where: { id: inputCar.id },
      data: {
        name: inputCar.name,
      },
    });
    expect(dbCarToDomain).toHaveBeenCalledTimes(1);
    expect(dbCarToDomain).toHaveBeenCalledWith(updatedDbCar);
    expect(result).toEqual(expectedDomainCar);
  });

  it('updates a car with different id and name correctly', async () => {
    const inputCar = car({
      id: '456',
      name: 'Updated Honda Civic',
    });
    const updatedDbCar = {
      id: '456',
      name: 'Updated Honda Civic',
      createdAt: new Date('2024-05-15T10:30:00Z'),
      updatedAt: new Date('2024-05-16T14:45:00Z'),
    };
    const expectedDomainCar = car({
      id: '456',
      name: 'Updated Honda Civic',
      createdAt: new Date('2024-05-15T10:30:00Z'),
      updatedAt: new Date('2024-05-16T14:45:00Z'),
    });

    const mockPrisma = {
      car: {
        update: vi.fn().mockResolvedValue(updatedDbCar),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbCarToDomain).mockReturnValue(expectedDomainCar);

    const result = await dbCarUpdate(inputCar);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.update).toHaveBeenCalledWith({
      where: { id: inputCar.id },
      data: {
        name: inputCar.name,
      },
    });
    expect(dbCarToDomain).toHaveBeenCalledTimes(1);
    expect(dbCarToDomain).toHaveBeenCalledWith(updatedDbCar);
    expect(result).toEqual(expectedDomainCar);
  });
});
